from Sastrawi.Stemmer.StemmerFactory import StemmerFactory
from Sastrawi.StopWordRemover.StopWordRemoverFactory import StopWordRemoverFactory
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Initialize factories and instances once so we don't recreate them on every function call
_stemmer_factory = StemmerFactory()
_stemmer = _stemmer_factory.create_stemmer()

_stopword_factory = StopWordRemoverFactory()
_stopword_remover = _stopword_factory.create_stop_word_remover()

def preprocess_indonesian_text(text: str) -> str:
    """Applies stopword removal and stemming to an Indonesian text."""
    if not text:
        return ""
    
    # 1. Remove stopwords
    no_stop_words = _stopword_remover.remove(text)
    
    # 2. Stemming
    stemmed = _stemmer.stem(no_stop_words)
    return stemmed


def _build_global_corpus():
    """
    Builds the global corpus by collecting ALL candidate profiles and ALL vacancy
    descriptions. This is required so that IDF values are computed across the
    entire dataset (A ∪ B), not just the two documents being compared.

    Returns:
        tuple: (
            all_candidates  - queryset of candidate User objects with non-empty profiles,
            all_vacancies   - queryset of all Vacancy objects with non-empty descriptions,
            clean_corpus    - list of preprocessed strings [profiles...] + [vacancies...],
            profile_count   - number of candidate documents in the corpus,
        )
    """
    from .models import User, Vacancy

    all_candidates = User.objects.filter(
        role=User.Role.CANDIDATE
    ).exclude(profile="")

    all_vacancies = Vacancy.objects.exclude(description="")

    clean_profiles = [preprocess_indonesian_text(c.profile) for c in all_candidates]
    clean_vacancies = [preprocess_indonesian_text(v.description) for v in all_vacancies]

    # Corpus = all profiles first, then all vacancies.
    # We track the split index so we can retrieve individual vectors later.
    corpus = clean_profiles + clean_vacancies
    profile_count = len(clean_profiles)

    return all_candidates, all_vacancies, corpus, profile_count


def calculate_similarity(candidate_profile: str, vacancy_description: str) -> float:
    """
    Calculates cosine similarity between a candidate's profile and a vacancy's
    description using TF-IDF fitted on the GLOBAL corpus (all profiles + all
    vacancy descriptions). Returns a percentage float (0.0 to 100.0).

    ⚠️  Why global corpus?
    IDF measures how rare/common a word is across ALL documents. If we only
    fit the vectorizer on these two texts, every word would have IDF = log(2/1),
    which is meaningless. We need the full A ∪ B set so that a word like
    "Laravel" gets a realistic IDF based on how often it appears across every
    profile and every vacancy in the system.
    """
    if not candidate_profile or not vacancy_description:
        return 0.0

    # 1. Preprocess the two target documents
    clean_profile = preprocess_indonesian_text(candidate_profile)
    clean_vacancy = preprocess_indonesian_text(vacancy_description)

    if not clean_profile or not clean_vacancy:
        return 0.0

    # 2. Build the global corpus for IDF fitting
    _, _, global_corpus, _ = _build_global_corpus()

    # 3. If the global corpus is too small (e.g. brand-new system with no data yet),
    #    fall back to fitting on just the two documents so the function still works.
    if len(global_corpus) < 2:
        global_corpus = [clean_profile, clean_vacancy]

    # 4. Fit vectorizer on the global corpus, then transform only the two target docs
    vectorizer = TfidfVectorizer()
    try:
        vectorizer.fit(global_corpus)
        tfidf_pair = vectorizer.transform([clean_profile, clean_vacancy])
        similarity_matrix = cosine_similarity(tfidf_pair[0:1], tfidf_pair[1:2])
        score = similarity_matrix[0][0] * 100.0
        return round(score, 2)
    except ValueError:
        # Happens if vocabulary is empty after preprocessing
        return 0.0


def recalculate_user_vacancies(user):
    """
    Recalculates the TF-IDF cosine similarity scores between a single candidate
    (user) and EVERY vacancy in the system.

    The TF-IDF vectorizer is fitted on the GLOBAL corpus (all candidate profiles
    + all vacancy descriptions) so that IDF values reflect the full dataset.
    """
    from .models import Calculation

    all_candidates, all_vacancies, global_corpus, profile_count = _build_global_corpus()

    if not global_corpus or not user.profile:
        return

    # Find the index of this user's profile inside the corpus
    candidate_list = list(all_candidates)
    try:
        user_idx = next(i for i, c in enumerate(candidate_list) if c.pk == user.pk)
    except StopIteration:
        # This user's profile was not included (e.g. empty profile at build time)
        return

    vectorizer = TfidfVectorizer()
    try:
        tfidf_matrix = vectorizer.fit_transform(global_corpus)
    except ValueError:
        return

    # User vector sits at index `user_idx` in the matrix
    user_vector = tfidf_matrix[user_idx : user_idx + 1]

    # Vacancy vectors start right after all profiles
    vacancy_list = list(all_vacancies)
    vacancy_start = profile_count
    vacancy_vectors = tfidf_matrix[vacancy_start:]

    if vacancy_vectors.shape[0] == 0:
        return

    similarity_scores = cosine_similarity(user_vector, vacancy_vectors)[0]

    for i, vacancy in enumerate(vacancy_list):
        score = round(similarity_scores[i] * 100.0, 2)
        Calculation.objects.update_or_create(
            user=user,
            vacancy=vacancy,
            defaults={"percentage": score},
        )


def recalculate_vacancy_candidates(vacancy):
    """
    Recalculates the TF-IDF cosine similarity scores between a single vacancy
    and EVERY candidate in the system.

    The TF-IDF vectorizer is fitted on the GLOBAL corpus (all candidate profiles
    + all vacancy descriptions) so that IDF values reflect the full dataset.
    """
    from .models import Calculation

    all_candidates, all_vacancies, global_corpus, profile_count = _build_global_corpus()

    if not global_corpus or not vacancy.description:
        return

    # Find the index of this vacancy inside the corpus
    vacancy_list = list(all_vacancies)
    try:
        vacancy_idx = next(i for i, v in enumerate(vacancy_list) if v.pk == vacancy.pk)
    except StopIteration:
        # This vacancy's description was not included (e.g. empty description at build time)
        return

    vectorizer = TfidfVectorizer()
    try:
        tfidf_matrix = vectorizer.fit_transform(global_corpus)
    except ValueError:
        return

    # Vacancy vectors start right after all profiles in the corpus
    vacancy_vector = tfidf_matrix[profile_count + vacancy_idx : profile_count + vacancy_idx + 1]

    # All candidate vectors are at the start of the matrix
    candidate_list = list(all_candidates)
    candidate_vectors = tfidf_matrix[:profile_count]

    if candidate_vectors.shape[0] == 0:
        return

    similarity_scores = cosine_similarity(vacancy_vector, candidate_vectors)[0]

    for i, candidate in enumerate(candidate_list):
        score = round(similarity_scores[i] * 100.0, 2)
        Calculation.objects.update_or_create(
            user=candidate,
            vacancy=vacancy,
            defaults={"percentage": score},
        )

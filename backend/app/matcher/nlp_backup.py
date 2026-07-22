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

def calculate_similarity(candidate_profile: str, vacancy_description: str) -> float:
    """
    Calculates cosine similarity between a candidate's profile and a vacancy's description
    using TF-IDF. Returns a percentage float (0.0 to 100.0).
    """
    if not candidate_profile or not vacancy_description:
        return 0.0

    # 1. Preprocess both texts
    clean_profile = preprocess_indonesian_text(candidate_profile)
    clean_vacancy = preprocess_indonesian_text(vacancy_description)
    
    if not clean_profile or not clean_vacancy:
        return 0.0

    # 2. Calculate TF-IDF and Cosine Similarity
    vectorizer = TfidfVectorizer()
    try:
        tfidf_matrix = vectorizer.fit_transform([clean_profile, clean_vacancy])
        # The matrix has 2 rows. 
        # tfidf_matrix[0] is the profile, tfidf_matrix[1] is the vacancy.
        # cosine_similarity expects a matrix, returning a matrix of pairwise similarities.
        similarity_matrix = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])
        score = similarity_matrix[0][0] * 100.0
        return round(score, 2)
    except ValueError:
        # Happens if vocab is empty after stop words
        return 0.0

def recalculate_user_vacancies(user):
    """Calculates TF-IDF of a user against ALL vacancies."""
    from .models import Vacancy, Calculation
    vacancies = Vacancy.objects.all()
    if not vacancies or not user.profile:
        return
        
    vacancy_descriptions = [v.description for v in vacancies]
    clean_vacancies = [preprocess_indonesian_text(d) for d in vacancy_descriptions]
    clean_profile = preprocess_indonesian_text(user.profile)
    
    if not clean_profile:
        return

    vectorizer = TfidfVectorizer()
    try:
        tfidf_matrix = vectorizer.fit_transform([clean_profile] + clean_vacancies)
        similarity_matrix = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:])
        scores = similarity_matrix[0]
    except ValueError:
        scores = [0.0] * len(vacancies)

    for i, vacancy in enumerate(vacancies):
        score = round(scores[i] * 100.0, 2)
        Calculation.objects.update_or_create(
            user=user,
            vacancy=vacancy,
            defaults={"percentage": score}
        )

def recalculate_vacancy_candidates(vacancy):
    """Calculates TF-IDF of a vacancy against ALL candidates."""
    from .models import User, Calculation
    candidates = User.objects.filter(role=User.Role.CANDIDATE).exclude(profile="")
    if not candidates or not vacancy.description:
        return
        
    candidate_profiles = [c.profile for c in candidates]
    clean_profiles = [preprocess_indonesian_text(p) for p in candidate_profiles]
    clean_vacancy = preprocess_indonesian_text(vacancy.description)
    
    if not clean_vacancy:
        return

    vectorizer = TfidfVectorizer()
    try:
        tfidf_matrix = vectorizer.fit_transform([clean_vacancy] + clean_profiles)
        similarity_matrix = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:])
        scores = similarity_matrix[0]
    except ValueError:
        scores = [0.0] * len(candidates)

    for i, candidate in enumerate(candidates):
        score = round(scores[i] * 100.0, 2)
        Calculation.objects.update_or_create(
            user=candidate,
            vacancy=vacancy,
            defaults={"percentage": score}
        )


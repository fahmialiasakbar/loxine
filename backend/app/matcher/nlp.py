import math
from collections import Counter
from Sastrawi.Stemmer.StemmerFactory import StemmerFactory
from Sastrawi.StopWordRemover.StopWordRemoverFactory import StopWordRemoverFactory

# Inisialisasi Sastrawi
_stemmer_factory = StemmerFactory()
_stemmer = _stemmer_factory.create_stemmer()

_stopword_factory = StopWordRemoverFactory()
_stopword_remover = _stopword_factory.create_stop_word_remover()

def preprocess_indonesian_text(text: str) -> str:
    """Applies stopword removal and stemming."""
    if not text:
        return ""
    # 1. Case folding (huruf kecil)
    text = text.lower()
    # 2. Remove stopwords
    no_stop_words = _stopword_remover.remove(text)
    # 3. Stemming
    stemmed = _stemmer.stem(no_stop_words)
    return stemmed

def calculate_cosine_similarity_manual(vec_a, vec_b) -> float:
    """Menghitung cosine similarity dari dua vektor (persis rumus Excel)"""
    dot_product = sum(a * b for a, b in zip(vec_a, vec_b))
    mag_a = math.sqrt(sum(a**2 for a in vec_a))
    mag_b = math.sqrt(sum(b**2 for b in vec_b))
    
    if mag_a == 0 or mag_b == 0:
        return 0.0
        
    return dot_product / (mag_a * mag_b)

def recalculate_all_similarities():
    """
    Fungsi ini menyatukan semua Loker dan Profil jadi satu populasi (Corpus)
    agar nilai IDF-nya konsisten dengan perhitungan di Excel.
    """
    from .models import User, Vacancy, Calculation
    
    candidates = list(User.objects.filter(role=User.Role.CANDIDATE).exclude(profile=""))
    vacancies = list(Vacancy.objects.all())
    
    if not candidates or not vacancies:
        return
        
    # 1. Preprocess semua data
    clean_vacancies = [preprocess_indonesian_text(v.description) for v in vacancies]
    clean_profiles = [preprocess_indonesian_text(c.profile) for c in candidates]
    
    # 2. Gabungkan jadi populasi
    corpus = clean_vacancies + clean_profiles
    N = len(corpus)
    
    import re
    # Menggunakan regex yang sama dengan token_pattern default TfidfVectorizer sklearn
    tokenized_corpus = [re.findall(r'\b\w\w+\b', text) for text in corpus]
    
    # 3. Hitung Document Frequency (DF)
    df = {}
    for words in tokenized_corpus:
        for w in set(words):
            df[w] = df.get(w, 0) + 1
            
    # 4. Hitung IDF menggunakan Rumus Sklearn (sesuai file Excel)
    vocab = sorted(list(df.keys()))
    idf = {w: math.log((N + 1) / (df[w] + 1)) + 1 for w in vocab}
    
    # 5. Buat Matriks TF-IDF untuk Semua Dokumen
    tfidf_matrix = []
    for words in tokenized_corpus:
        vec = []
        tf = Counter(words)
        for w in vocab:
            vec.append(tf[w] * idf[w]) # TF * IDF
        tfidf_matrix.append(vec)
        
    # Pisahkan kembali matriks loker dan matriks pelamar
    num_vacancies = len(vacancies)
    vacancy_matrix = tfidf_matrix[:num_vacancies]
    candidate_matrix = tfidf_matrix[num_vacancies:]
    
    # 6. Hitung Cosine Similarity & Simpan ke Database
    for i, candidate in enumerate(candidates):
        for j, vacancy in enumerate(vacancies):
            # Ambil vektor milik pelamar (i) dan loker (j)
            vec_candidate = candidate_matrix[i]
            vec_vacancy = vacancy_matrix[j]
            
            # Hitung pakai rumus manual
            cosine_score = calculate_cosine_similarity_manual(vec_candidate, vec_vacancy)
            percentage = round(cosine_score * 100.0, 2)
            
            # Simpan hasil ke database
            Calculation.objects.update_or_create(
                user=candidate,
                vacancy=vacancy,
                defaults={"percentage": percentage}
            )
            
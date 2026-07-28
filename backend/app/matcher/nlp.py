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
    """Applies stopword removal and stemming, matching Excel's simulation preprocessing."""
    if not text:
        return ""
    # 1. Case folding (huruf kecil)
    text = text.lower()
    
    # 2. Remove stopwords via Sastrawi
    no_stop = _stopword_remover.remove(text)
    
    # 3. Stemming via Sastrawi
    stemmed = _stemmer.stem(no_stop)
    
    # 4. Custom adjustments to match the Excel sheet's preprocessing exactly:
    words = stemmed.split()
    adjusted_words = []
    
    # Extra stopwords that were removed in Excel but not by default Sastrawi:
    extra_stopwords = {'juga', 'belum', 'saya', 'namun', 'untuk', 'yang', 'dan', 'tapi', 'dengan', 'di'}
    
    for w in words:
        if w in extra_stopwords:
            continue
        
        # Word mappings/corrections:
        if w == 'pemrograman':
            w = 'program'
        elif w == 'usaha':
            w = 'perusahaan'
        elif w == 'desainer':
            w = 'desain'
            
        adjusted_words.append(w)
        
    return " ".join(adjusted_words)

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
    
    candidates = list(User.objects.filter(role=User.Role.CANDIDATE).exclude(profile="").order_by('id'))
    vacancies = list(Vacancy.objects.all().order_by('id'))
    
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
    
    # Generate doc labels (L1..L5, P1..P10)
    doc_labels = [f"L{idx+1}" for idx in range(len(vacancies))] + [f"P{idx+1}" for idx in range(len(candidates))]
    
    # Build vocabulary data with DF and TF details
    vocabulary_data = {}
    for w in vocab:
        tf_data = {}
        for doc_label, words in zip(doc_labels, tokenized_corpus):
            count = words.count(w)
            if count > 0:
                tf_data[doc_label] = count
        vocabulary_data[w] = {
            "document_frequency": df[w],
            "term_frequencies": tf_data
        }
        
    documents_data = {doc_label: text for doc_label, text in zip(doc_labels, corpus)}
    
    # Save corpus to JSON file
    import json
    import os
    from django.conf import settings
    try:
        corpus_file_path = os.path.join(settings.BASE_DIR, "corpus_vocab.json")
        with open(corpus_file_path, "w", encoding="utf-8") as f:
            json.dump({
                "total_words": len(vocab),
                "documents": documents_data,
                "vocabulary": vocabulary_data
            }, f, indent=4)
    except Exception as e:
        print("Error saving corpus file:", e)
        
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
            
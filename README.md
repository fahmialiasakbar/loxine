# Loxine

**Identitas Penulis:**
- **Nama:** Fahmi Akbar
- **NRP:** 191116016
- **Program Studi:** S1 - Informatika
- **Perguruan Tinggi:** Universitas Bhinneka Nusantara
- **Judul Skripsi:** Penggunaan Natural Language Processing untuk Analisis dan Pencocokan Lowongan Kerja pada Sistem Informasi Berbasis Web dengan Metode Cosine Similarity

Loxine adalah portal penghubung antara pencari kerja dan perusahaan.

Stack utama:
- Backend: Django REST API + JWT
- Frontend: Next.js + Bootstrap
- Database: PostgreSQL
- Orkestrasi: Docker Compose

## Struktur
- `backend`: service API Django
- `frontend`: service web Next.js
- `compose.yaml`: orkestrasi semua service

## Fitur Utama
- Register kandidat
- Login untuk semua role dengan JWT auth (`access` + `refresh`)
- Seed super admin otomatis
- Super admin dapat membuat company dan admin company
- Endpoint list/create vacancy
- Cek profil login

## Panduan Menjalankan Aplikasi menggunakan Docker

### Prasyarat
- Docker
- Docker Compose (plugin `docker compose`)

### Langkah Instalasi
1. Masuk ke folder project `loxine`.
2. Jalankan perintah berikut untuk mem-build dan menjalankan semua container di background:

```bash
docker compose up -d --build
```

Compose akan menjalankan:
- `db` pada PostgreSQL (port `5437`)
- `backend` pada port `8001`
- `frontend` pada port `3000`

### URL Layanan
- Frontend: http://localhost:3000
- Backend API base: http://localhost:8001/api
- Django admin: http://localhost:8001/admin

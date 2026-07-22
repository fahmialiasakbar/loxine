import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from matcher.models import User, Company, Vacancy, Calculation

# Delete current data
print("Deleting old data...")
Calculation.objects.all().delete()
Vacancy.objects.all().delete()
Company.objects.all().delete()
# Keep superusers and admin company users if needed, or delete all candidates.
User.objects.filter(role=User.Role.CANDIDATE).delete()

# Create companies
c1 = Company.objects.create(name="Jaya Creative", location="Indonesia")
c2 = Company.objects.create(name="Dinata Solusi", location="Indonesia")

print("Created Companies.")

# Create vacancies
v1 = Vacancy.objects.create(company=c1, title="Web Developer", description="Dicari Web Developer yang menguasai pemrograman PHP, framework Laravel, database MySQL, dan pembuatan REST API.", location="Jakarta Selatan")
v2 = Vacancy.objects.create(company=c1, title="Data Scientist", description="Perusahaan membutuhkan Data Scientist ahli Python, SQL, algoritma Machine Learning, dan analisis statistik data.", location="Bandung")
v3 = Vacancy.objects.create(company=c1, title="UI/UX Designer", description="Mencari UI/UX Designer untuk membuat prototyping, wireframing, riset pengguna, dan mahir menggunakan Figma.", location="Yogyakarta")
v4 = Vacancy.objects.create(company=c2, title="Graphic Designer", description="Dibutuhkan Graphic Designer kreatif yang menguasai Adobe Photoshop, Illustrator, desain kreatif, dan branding.", location="Surabaya")
v5 = Vacancy.objects.create(company=c2, title="Akuntan Pajak", description="Mencari Akuntan Pajak berpengalaman mengelola laporan keuangan, rekonsiliasi bank, pajak perusahaan, dan Microsoft Excel.", location="Malang")

print("Created Vacancies.")

# Create users
users_data = [
    ("Budi Santoso", "Saya Web Developer berpengalaman menggunakan PHP, framework Laravel, database MySQL, dan terbiasa membuat REST API.", "budi.santoso@yopmail.com"),
    ("Andi Wijaya", "Fullstack developer yang menguasai pemrograman PHP dan MySQL, namun juga bisa menggunakan Adobe Photoshop untuk desain banner web.", "andi.wijaya@yopmail.com"),
    ("Citra Dewi", "Lulusan Statistika yang fokus sebagai Data Scientist. Mahir Python, SQL, dan pemodelan Machine Learning untuk analisis data.", "citra.dewi@yopmail.com"),
    ("Deni Setiawan", "Data analyst yang terbiasa melakukan query dengan SQL dan database MySQL. Sedikit paham Python tapi belum belajar Machine Learning.", "deni.setiawan@yopmail.com"),
    ("Eko Prasetyo", "UI/UX Designer spesialis produk digital. Sangat mahir menggunakan Figma untuk wireframing, prototyping, dan riset pengguna.", "eko.prasetyo@yopmail.com"),
    ("Fitriani", "Desainer serbabisa yang menguasai Figma untuk desain UI dan juga terbiasa menggunakan Adobe Illustrator untuk membuat aset grafis.", "fitriani@yopmail.com"),
    ("Gilang Ramadhan", "Graphic Designer kreatif dengan portofolio luas di bidang branding, mahir menggunakan Adobe Photoshop dan Illustrator.", "gilang.ramadhan@yopmail.com"),
    ("Hendra Wijaya", "Akuntan senior yang ahli menyusun laporan keuangan perusahaan, audit internal, manajemen pajak, dan tingkat lanjut Microsoft Excel.", "hendra.wijaya@yopmail.com"),
    ("Ira Maya", "Finance staff yang terbiasa mengelola keuangan dan rekonsiliasi bank, mahir menggunakan Microsoft Excel namun belum paham pajak.", "ira.maya@yopmail.com"),
    ("Joko Susilo", "Lulusan baru administrasi perkantoran yang menguasai Microsoft Excel untuk input data logistik, belum punya pengalaman akuntansi.", "joko.susilo@yopmail.com")
]

for name, profile, email in users_data:
    u = User.objects.create_user(
        email=email,
        password="Password123",
        fullname=name,
        profile=profile,
        role=User.Role.CANDIDATE
    )
    print(f"Created User: {name} ({email})")

print("Seeding done!")

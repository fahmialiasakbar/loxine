from django.contrib import admin

from .models import Calculation, Company, User, Vacancy


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("id", "email", "fullname", "role", "is_staff", "is_superuser")
    search_fields = ("email", "fullname")
    list_filter = ("role", "is_staff", "is_superuser")


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ("id", "location")


@admin.register(Vacancy)
class VacancyAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "company", "location")


@admin.register(Calculation)
class CalculationAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "vacancy", "percentage", "application_status", "is_offered")

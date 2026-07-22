from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    AdminCompanyCreateAPIView,
    ApplyVacancyAPIView,
    CalculationDetailAPIView,
    CalculationListAPIView,
    CandidateListAPIView,
    CompanyDetailAPIView,
    CompanyListCreateAPIView,
    LoginAPIView,
    MeAPIView,
    ProfileUpdateAPIView,
    RegisterCandidateAPIView,
    VacancyApplicantsAPIView,
    VacancyDetailAPIView,
    VacancyListCreateAPIView,
)

urlpatterns = [
    path("auth/register/", RegisterCandidateAPIView.as_view(), name="register-candidate"),
    path("auth/login/", LoginAPIView.as_view(), name="login"),
    path("auth/me/", MeAPIView.as_view(), name="me"),
    path("auth/profile/", ProfileUpdateAPIView.as_view(), name="profile-update"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("admin-company/", AdminCompanyCreateAPIView.as_view(), name="admin-company-create"),
    path("companies/", CompanyListCreateAPIView.as_view(), name="companies"),
    path("companies/<int:pk>/", CompanyDetailAPIView.as_view(), name="company-detail"),
    path("vacancies/", VacancyListCreateAPIView.as_view(), name="vacancies"),
    path("vacancies/<int:pk>/", VacancyDetailAPIView.as_view(), name="vacancy-detail"),
    path("vacancies/<int:pk>/apply/", ApplyVacancyAPIView.as_view(), name="vacancy-apply"),
    path("vacancies/<int:pk>/applicants/", VacancyApplicantsAPIView.as_view(), name="vacancy-applicants"),
    path("calculations/", CalculationListAPIView.as_view(), name="calculations"),
    path("calculations/<int:pk>/", CalculationDetailAPIView.as_view(), name="calculation-detail"),
    path("candidates/", CandidateListAPIView.as_view(), name="candidates"),
]

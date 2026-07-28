from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Calculation, Company, Vacancy

User = get_user_model()


class UserResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "fullname", "email", "photo", "profile", "role")


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("fullname", "photo", "profile")


class CandidateRegisterSerializer(serializers.Serializer):
    fullname = serializers.CharField(max_length=255)
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8, write_only=True)
    photo = serializers.URLField(required=False, allow_blank=True)
    profile = serializers.CharField(required=False, allow_blank=True)

    def validate_email(self, value: str) -> str:
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists")
        return value


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class AdminCompanyCreateSerializer(serializers.Serializer):
    fullname = serializers.CharField(max_length=255)
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8, write_only=True)
    photo = serializers.URLField(required=False, allow_blank=True)
    profile = serializers.CharField(required=False, allow_blank=True)

    def validate_email(self, value: str) -> str:
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists")
        return value


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ("id", "name", "location", "image", "description")


class VacancySerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source="company.name", read_only=True)
    company_image = serializers.CharField(source="company.image", read_only=True)

    class Meta:
        model = Vacancy
        fields = ("id", "company", "company_name", "company_image", "title", "description", "location")


class CalculationSerializer(serializers.ModelSerializer):
    user_fullname = serializers.CharField(source="user.fullname", read_only=True)
    user_photo = serializers.CharField(source="user.photo", read_only=True)
    user_profile = serializers.CharField(source="user.profile", read_only=True)
    user_email = serializers.CharField(source="user.email", read_only=True)
    vacancy_title = serializers.CharField(source="vacancy.title", read_only=True)
    vacancy_location = serializers.CharField(source="vacancy.location", read_only=True)
    vacancy_description = serializers.CharField(source="vacancy.description", read_only=True)
    company_name = serializers.CharField(source="vacancy.company.name", read_only=True)
    company_image = serializers.CharField(source="vacancy.company.image", read_only=True)

    class Meta:
        model = Calculation
        fields = (
            "id",
            "user",
            "user_fullname",
            "user_photo",
            "user_profile",
            "user_email",
            "vacancy",
            "vacancy_title",
            "vacancy_location",
            "vacancy_description",
            "company_name",
            "company_image",
            "percentage",
            "is_offered",
            "application_status",
            "offered_at",
            "applied_at",
            "rejected_at",
            "accepted_at",
        )
        read_only_fields = ("applied_at",)


class CalculationStatusUpdateSerializer(serializers.Serializer):
    application_status = serializers.ChoiceField(
        choices=Calculation.ApplicationStatus.choices,
        required=False,
    )
    is_offered = serializers.BooleanField(required=False)

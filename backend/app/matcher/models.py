from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.models import AbstractUser
from django.db import models


class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, email: str, password: str, **extra_fields):
        if not email:
            raise ValueError("The email must be set")

        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email: str, password: str | None = None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        extra_fields.setdefault("role", User.Role.CANDIDATE)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email: str, password: str, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", User.Role.SUPER_ADMIN)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True")

        return self._create_user(email, password, **extra_fields)


class User(AbstractUser):
    class Role(models.TextChoices):
        SUPER_ADMIN = "super_admin", "Super Admin"
        ADMIN_COMPANY = "admin_company", "Admin Company"
        CANDIDATE = "candidate", "Candidate"

    username = None
    fullname = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    photo = models.URLField(blank=True)
    profile = models.TextField(blank=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.CANDIDATE)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["fullname"]

    objects = UserManager()

    def __str__(self) -> str:
        return self.email


class Company(models.Model):
    name = models.CharField(max_length=255, default="")
    location = models.CharField(max_length=255)
    image = models.URLField(blank=True)
    description = models.TextField()

    def __str__(self) -> str:
        return f"{self.name} ({self.location})"


class Vacancy(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="vacancies")
    title = models.CharField(max_length=255)
    description = models.TextField()
    location = models.CharField(max_length=255)

    def __str__(self) -> str:
        return self.title


class Calculation(models.Model):
    class ApplicationStatus(models.TextChoices):
        NONE = "none", "None"
        PENDING = "pending", "Pending"
        REJECTED = "rejected", "Rejected"
        ACCEPTED = "accepted", "Accepted"

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="calculations")
    vacancy = models.ForeignKey(Vacancy, on_delete=models.CASCADE, related_name="calculations")
    percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    is_offered = models.BooleanField(default=False)
    application_status = models.CharField(
        max_length=10,
        choices=ApplicationStatus.choices,
        default=ApplicationStatus.NONE,
    )
    offered_at = models.DateTimeField(null=True, blank=True)
    applied_at = models.DateTimeField(auto_now_add=True)
    rejected_at = models.DateTimeField(null=True, blank=True)
    accepted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ("user", "vacancy")

    def __str__(self) -> str:
        return f"Calc #{self.id} - User {self.user_id} Vacancy {self.vacancy_id}"


from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=User)
def trigger_user_recalculation(sender, instance, created, **kwargs):
    # Only recalculate if they are a candidate and have a profile
    if instance.role == User.Role.CANDIDATE and instance.profile:
        from .nlp import recalculate_all_similarities
        recalculate_all_similarities()

@receiver(post_save, sender=Vacancy)
def trigger_vacancy_recalculation(sender, instance, created, **kwargs):
    if instance.description:
        from .nlp import recalculate_all_similarities
        recalculate_all_similarities()

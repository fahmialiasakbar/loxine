from django.contrib.auth import authenticate, get_user_model
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Calculation, Company, Vacancy
from .permissions import IsAdminCompany, IsSuperAdmin
from .serializers import (
    AdminCompanyCreateSerializer,
    CalculationSerializer,
    CalculationStatusUpdateSerializer,
    CandidateRegisterSerializer,
    CompanySerializer,
    LoginSerializer,
    UserProfileUpdateSerializer,
    UserResponseSerializer,
    VacancySerializer,
)

User = get_user_model()


class RegisterCandidateAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = CandidateRegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = User.objects.create_user(
            fullname=serializer.validated_data["fullname"],
            email=serializer.validated_data["email"],
            password=serializer.validated_data["password"],
            photo=serializer.validated_data.get("photo", ""),
            profile=serializer.validated_data.get("profile", ""),
            role=User.Role.CANDIDATE,
        )

        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "user": UserResponseSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = authenticate(
            request,
            email=serializer.validated_data["email"],
            password=serializer.validated_data["password"],
        )

        if not user:
            return Response(
                {"detail": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "user": UserResponseSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )


class MeAPIView(APIView):
    def get(self, request):
        return Response(UserResponseSerializer(request.user).data, status=status.HTTP_200_OK)


class ProfileUpdateAPIView(APIView):
    """Update current user profile (fullname, photo, profile text)."""

    def put(self, request):
        serializer = UserProfileUpdateSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserResponseSerializer(request.user).data, status=status.HTTP_200_OK)


class CompanyListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = CompanySerializer

    def get_queryset(self):
        qs = Company.objects.all().order_by("id")
        user = self.request.user
        
        if user.is_authenticated and user.role == User.Role.ADMIN_COMPANY:
            if user.fullname.lower().startswith("admin "):
                company_name = user.fullname[6:].strip()
            else:
                company_name = user.fullname
                
            qs = qs.filter(name__iexact=company_name)
            
        return qs

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated(), IsSuperAdmin()]
        return [permissions.IsAuthenticated()]


class CompanyDetailAPIView(generics.RetrieveUpdateAPIView):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer

    def get_permissions(self):
        if self.request.method in ("PUT", "PATCH"):
            return [permissions.IsAuthenticated(), IsSuperAdmin()]
        return [permissions.IsAuthenticated()]


class AdminCompanyCreateAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsSuperAdmin]

    def post(self, request):
        serializer = AdminCompanyCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = User.objects.create_user(
            fullname=serializer.validated_data["fullname"],
            email=serializer.validated_data["email"],
            password=serializer.validated_data["password"],
            photo=serializer.validated_data.get("photo", ""),
            profile=serializer.validated_data.get("profile", ""),
            role=User.Role.ADMIN_COMPANY,
        )

        return Response(UserResponseSerializer(user).data, status=status.HTTP_201_CREATED)


class VacancyListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = VacancySerializer

    def get_queryset(self):
        qs = Vacancy.objects.select_related("company").all().order_by("id")
        user = self.request.user
        
        if user.is_authenticated and user.role == User.Role.ADMIN_COMPANY:
            if user.fullname.lower().startswith("admin "):
                company_name = user.fullname[6:].strip()
            else:
                company_name = user.fullname
                
            qs = qs.filter(company__name__iexact=company_name)
            
        return qs

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated(), IsAdminCompany()]
        return [permissions.IsAuthenticated()]


class VacancyDetailAPIView(generics.RetrieveAPIView):
    queryset = Vacancy.objects.select_related("company").all()
    serializer_class = VacancySerializer


class ApplyVacancyAPIView(APIView):
    """Candidate applies to a vacancy. Creates a Calculation record."""

    def post(self, request, pk):
        if request.user.role != User.Role.CANDIDATE:
            return Response(
                {"detail": "Only candidates can apply"},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            vacancy = Vacancy.objects.get(pk=pk)
        except Vacancy.DoesNotExist:
            return Response(
                {"detail": "Vacancy not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        if Calculation.objects.filter(
            user=request.user, 
            vacancy=vacancy, 
            application_status__in=["pending", "accepted", "rejected"]
        ).exists():
            return Response(
                {"detail": "Already applied to this vacancy"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Get or create the calculation, and mark as pending
        # The NLP percentage is already calculated in the background via signals.
        calc, created = Calculation.objects.get_or_create(
            user=request.user,
            vacancy=vacancy
        )
        calc.application_status = Calculation.ApplicationStatus.PENDING
        calc.save()

        return Response(
            CalculationSerializer(calc).data,
            status=status.HTTP_201_CREATED,
        )


class VacancyApplicantsAPIView(APIView):
    """Get applicants and recommended candidates for a vacancy."""

    def get(self, request, pk):
        try:
            vacancy = Vacancy.objects.select_related("company").get(pk=pk)
        except Vacancy.DoesNotExist:
            return Response(
                {"detail": "Vacancy not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        calculations = Calculation.objects.filter(vacancy=vacancy).select_related("user").order_by("-percentage")

        # Split into applicants (applied) and recommended (all candidates with calculations)
        applicants = calculations.filter(application_status="pending")
        offered = calculations.filter(is_offered=True)
        accepted = calculations.filter(application_status="accepted")
        rejected = calculations.filter(application_status="rejected")

        return Response({
            "vacancy": VacancySerializer(vacancy).data,
            "applicants": CalculationSerializer(calculations, many=True).data,
            "total": calculations.count(),
        })


class CalculationListAPIView(generics.ListAPIView):
    serializer_class = CalculationSerializer

    def get_queryset(self):
        user = self.request.user
        qs = Calculation.objects.select_related("user", "vacancy").all().order_by("-applied_at")

        if user.role == User.Role.CANDIDATE:
            qs = qs.filter(user=user)

        return qs


class CalculationDetailAPIView(APIView):
    """Get or update a single calculation."""

    def get(self, request, pk):
        try:
            calc = Calculation.objects.select_related("user", "vacancy", "vacancy__company").get(pk=pk)
        except Calculation.DoesNotExist:
            return Response(
                {"detail": "Calculation not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(CalculationSerializer(calc).data)

    def patch(self, request, pk):
        try:
            calc = Calculation.objects.select_related("user", "vacancy").get(pk=pk)
        except Calculation.DoesNotExist:
            return Response(
                {"detail": "Calculation not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = CalculationStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if "application_status" in serializer.validated_data:
            new_status = serializer.validated_data["application_status"]
            calc.application_status = new_status
            if new_status == "accepted":
                calc.accepted_at = timezone.now()
            elif new_status == "rejected":
                calc.rejected_at = timezone.now()

        if "is_offered" in serializer.validated_data:
            calc.is_offered = serializer.validated_data["is_offered"]
            if calc.is_offered:
                calc.offered_at = timezone.now()

        calc.save()
        return Response(CalculationSerializer(calc).data)


class CandidateListAPIView(generics.ListAPIView):
    """List all candidates (for super_admin)."""
    serializer_class = UserResponseSerializer
    permission_classes = [permissions.IsAuthenticated, IsSuperAdmin]

    def get_queryset(self):
        return User.objects.filter(role=User.Role.CANDIDATE).order_by("id")

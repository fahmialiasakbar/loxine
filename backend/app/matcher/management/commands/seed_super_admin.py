from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Seed super admin user for Loxine"

    def handle(self, *args, **options):
        user_model = get_user_model()
        email = "admin@loxine.com"
        password = "12ns28112em"

        user, created = user_model.objects.get_or_create(
            email=email,
            defaults={
                "fullname": "Loxine Super Admin",
                "role": user_model.Role.SUPER_ADMIN,
                "is_staff": True,
                "is_superuser": True,
            },
        )

        if created:
            user.set_password(password)
            user.save()
            self.stdout.write(self.style.SUCCESS("Super admin created"))
            return

        updated = False
        if user.role != user_model.Role.SUPER_ADMIN:
            user.role = user_model.Role.SUPER_ADMIN
            updated = True
        if not user.is_staff:
            user.is_staff = True
            updated = True
        if not user.is_superuser:
            user.is_superuser = True
            updated = True
        user.set_password(password)
        updated = True

        if updated:
            user.save()

        self.stdout.write(self.style.SUCCESS("Super admin already exists"))

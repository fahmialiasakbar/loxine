from rest_framework import permissions

from .models import User


class IsSuperAdmin(permissions.BasePermission):
    message = "Only super admin can perform this action"

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == User.Role.SUPER_ADMIN
        )


class IsAdminCompany(permissions.BasePermission):
    message = "Only admin company can perform this action"

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == User.Role.ADMIN_COMPANY
        )

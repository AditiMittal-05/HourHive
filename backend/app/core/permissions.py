from fastapi import Depends
from app.core.exceptions import PermissionDeniedException, BusinessRuleException
from app.models.user import UserRole


def require_roles(*roles: UserRole):
    """Dependency factory — injects current_user and checks role membership."""
    from app.api.deps import get_current_active_user

    async def checker(current_user=Depends(get_current_active_user)):
        if current_user.role not in roles:
            raise PermissionDeniedException(
                f"Role '{current_user.role}' not allowed. Required: {[r.value for r in roles]}"
            )
        return current_user

    return checker


def require_admin():
    """Allow admin OR super_admin."""
    return require_roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)


def require_super_admin():
    """Allow super_admin only."""
    return require_roles(UserRole.SUPER_ADMIN)


def guard_super_admin_target(target_user) -> None:
    """Raise if the target user is the super_admin — they are immutable."""
    if target_user.role == UserRole.SUPER_ADMIN:
        raise BusinessRuleException("The SuperAdmin account cannot be modified, deactivated, or deleted.")


def can_manage_role(actor_role: UserRole, target_role: UserRole) -> bool:
    """
    Return True if actor is allowed to create/update a user with target_role.
    SuperAdmin can manage admins and employees.
    Admin can manage employees only.
    """
    if actor_role == UserRole.SUPER_ADMIN:
        return target_role in (UserRole.ADMIN, UserRole.EMPLOYEE)
    if actor_role == UserRole.ADMIN:
        return target_role == UserRole.EMPLOYEE
    return False

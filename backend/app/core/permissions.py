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


def require_super_admin():
    """Allow super_admin only."""
    return require_roles(UserRole.SUPER_ADMIN)


def require_approver():
    """Allow super_admin OR employees with can_approve_timesheets=True."""
    from app.api.deps import get_current_active_user

    async def checker(current_user=Depends(get_current_active_user)):
        if current_user.role == UserRole.SUPER_ADMIN or current_user.can_approve_timesheets:
            return current_user
        raise PermissionDeniedException("You do not have timesheet approval permissions.")

    return checker


def guard_super_admin_target(target_user) -> None:
    """Raise if the target user is the super_admin — they are immutable."""
    if target_user.role == UserRole.SUPER_ADMIN:
        raise BusinessRuleException(
            "The SuperAdmin account cannot be modified, deactivated, or deleted."
        )


def can_manage_role(actor_role: UserRole, target_role: UserRole) -> bool:
    """SuperAdmin can manage employees. Employees cannot manage anyone."""
    if actor_role == UserRole.SUPER_ADMIN:
        return target_role == UserRole.EMPLOYEE
    return False

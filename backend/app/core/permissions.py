from functools import wraps
from fastapi import Depends
from app.core.exceptions import PermissionDeniedException
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
    return require_roles(UserRole.ADMIN)

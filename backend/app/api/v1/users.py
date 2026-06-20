import math
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.database.session import get_db
from app.api.deps import get_current_active_user
from app.core.permissions import require_admin, require_super_admin
from app.schemas.user import UserCreate, UserUpdate, UserResponse, UserDropdown
from app.schemas.common import PaginatedResponse
from app.services.user_service import UserService
from app.models.user import UserRole, UserStatus

router = APIRouter(prefix="/users", tags=["User Management"])


@router.get("", response_model=PaginatedResponse)
def list_users(
    search: Optional[str] = Query(None),
    role: Optional[UserRole] = Query(None),
    status: Optional[UserStatus] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user=Depends(require_admin()),
    db: Session = Depends(get_db),
):
    # Admin only sees employees; SuperAdmin sees all (excluding super_admin themselves)
    exclude_super = current_user.role != UserRole.SUPER_ADMIN
    if current_user.role == UserRole.ADMIN and role == UserRole.ADMIN:
        # Admin cannot filter to see other admins
        role = UserRole.EMPLOYEE
    items, total = UserService(db).search(search, role, status, page, page_size,
                                          exclude_super_admin=exclude_super)
    return PaginatedResponse(
        items=[UserResponse.model_validate(u) for u in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=math.ceil(total / page_size) if page_size else 1,
    )


@router.post("", response_model=UserResponse, status_code=201)
def create_user(
    body: UserCreate,
    current_user=Depends(require_admin()),
    db: Session = Depends(get_db),
):
    user, _ = UserService(db).create(body, created_by=current_user.id, actor_role=current_user.role)
    return user


@router.get("/dropdown", response_model=list[UserDropdown])
def user_dropdown(
    _=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    return UserService(db).get_dropdown()


@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    current_user=Depends(require_admin()),
    db: Session = Depends(get_db),
):
    return UserService(db).get_detail(user_id)


@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    body: UserUpdate,
    current_user=Depends(require_admin()),
    db: Session = Depends(get_db),
):
    return UserService(db).update(user_id, body, updated_by=current_user.id, actor_role=current_user.role)


@router.patch("/{user_id}/deactivate")
def deactivate_user(
    user_id: int,
    current_user=Depends(require_admin()),
    db: Session = Depends(get_db),
):
    UserService(db).toggle_status(user_id, UserStatus.INACTIVE, updated_by=current_user.id)
    return {"message": "User deactivated"}


@router.patch("/{user_id}/activate")
def activate_user(
    user_id: int,
    current_user=Depends(require_admin()),
    db: Session = Depends(get_db),
):
    UserService(db).toggle_status(user_id, UserStatus.ACTIVE, updated_by=current_user.id)
    return {"message": "User activated"}

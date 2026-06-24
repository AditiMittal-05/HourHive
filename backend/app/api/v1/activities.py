from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.database.session import get_db
from app.api.deps import get_current_active_user
from app.core.permissions import require_super_admin
from app.schemas.activity import ActivityCreate, ActivityUpdate, ActivityResponse
from app.schemas.common import PaginatedResponse
from app.services.activity_service import ActivityService

router = APIRouter(prefix="/activities", tags=["Activity Management"])


@router.get("", response_model=PaginatedResponse)
def list_activities(
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    _=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    all_items = ActivityService(db).get_all()
    if search:
        search_lower = search.lower()
        all_items = [a for a in all_items
                     if search_lower in a.activity_name.lower() or search_lower in a.activity_code.lower()]
    total = len(all_items)
    start = (page - 1) * page_size
    items = all_items[start:start + page_size]
    return PaginatedResponse(
        items=[ActivityResponse.model_validate(a) for a in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size,
    )


@router.post("", response_model=ActivityResponse, status_code=201)
def create_activity(
    body: ActivityCreate,
    current_user=Depends(require_super_admin()),
    db: Session = Depends(get_db),
):
    return ActivityService(db).create(body, created_by=current_user.id)


@router.get("/active", response_model=list[ActivityResponse])
def active_activities(
    _=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    return ActivityService(db).get_active()


@router.get("/{activity_id}", response_model=ActivityResponse)
def get_activity(
    activity_id: int,
    _=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    from app.core.exceptions import NotFoundException
    from app.repositories.activity_repository import ActivityRepository
    activity = ActivityRepository(db).get(activity_id)
    if not activity or activity.is_deleted:
        raise NotFoundException("Activity not found")
    return activity


@router.put("/{activity_id}", response_model=ActivityResponse)
def update_activity(
    activity_id: int,
    body: ActivityUpdate,
    current_user=Depends(require_super_admin()),
    db: Session = Depends(get_db),
):
    return ActivityService(db).update(activity_id, body, updated_by=current_user.id)


@router.patch("/{activity_id}/deactivate")
def deactivate_activity(
    activity_id: int,
    current_user=Depends(require_super_admin()),
    db: Session = Depends(get_db),
):
    from app.models.activity import ActivityStatus
    ActivityService(db).toggle_status(activity_id, ActivityStatus.INACTIVE, updated_by=current_user.id)
    return {"message": "Activity deactivated"}


@router.patch("/{activity_id}/activate")
def activate_activity(
    activity_id: int,
    current_user=Depends(require_super_admin()),
    db: Session = Depends(get_db),
):
    from app.models.activity import ActivityStatus
    ActivityService(db).toggle_status(activity_id, ActivityStatus.ACTIVE, updated_by=current_user.id)
    return {"message": "Activity activated"}

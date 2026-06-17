from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.database.session import get_db
from app.api.deps import get_current_active_user
from app.core.permissions import require_admin
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse, ProjectDropdown
from app.schemas.common import PaginatedResponse
from app.services.project_service import ProjectService
from app.models.project import ProjectStatus

router = APIRouter(prefix="/projects", tags=["Project Management"])


@router.get("", response_model=PaginatedResponse)
def list_projects(
    search: Optional[str] = Query(None),
    status: Optional[ProjectStatus] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    _=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    items, total = ProjectService(db).search(search, status, page, page_size)
    return PaginatedResponse(
        items=[ProjectResponse.model_validate(p) for p in items],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post("", response_model=ProjectResponse, status_code=201)
def create_project(
    body: ProjectCreate,
    current_user=Depends(require_admin()),
    db: Session = Depends(get_db),
):
    return ProjectService(db).create(body, created_by=current_user.id)


@router.get("/dropdown", response_model=list[ProjectDropdown])
def project_dropdown(
    _=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    return ProjectService(db).get_active()


@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(
    project_id: int,
    _=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    return ProjectService(db).get_detail(project_id)


@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: int,
    body: ProjectUpdate,
    current_user=Depends(require_admin()),
    db: Session = Depends(get_db),
):
    return ProjectService(db).update(project_id, body, updated_by=current_user.id)


@router.patch("/{project_id}/deactivate")
def deactivate_project(
    project_id: int,
    current_user=Depends(require_admin()),
    db: Session = Depends(get_db),
):
    ProjectService(db).toggle_status(project_id, ProjectStatus.INACTIVE, updated_by=current_user.id)
    return {"message": "Project deactivated"}

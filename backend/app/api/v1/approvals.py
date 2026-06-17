from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.database.session import get_db
from app.api.deps import get_current_active_user
from app.core.permissions import require_admin
from app.schemas.timesheet import TimesheetHeaderResponse
from app.schemas.common import PaginatedResponse
from app.services.approval_service import ApprovalService
from app.repositories.timesheet_repository import TimesheetHeaderRepository

router = APIRouter(prefix="/approvals", tags=["Approval Workflow"])


class ApprovalAction(BaseModel):
    comment: Optional[str] = None


class RejectAction(BaseModel):
    comment: str


@router.get("/pending", response_model=PaginatedResponse)
def pending_approvals(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    _=Depends(require_admin()),
    db: Session = Depends(get_db),
):
    items, total = ApprovalService(db).get_pending(page, page_size)
    return PaginatedResponse(
        items=[_to_response(h) for h in items],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post("/{header_id}/approve", response_model=TimesheetHeaderResponse)
def approve(
    header_id: int,
    body: ApprovalAction,
    current_user=Depends(require_admin()),
    db: Session = Depends(get_db),
):
    header = ApprovalService(db).approve(header_id, current_user.id, body.comment)
    return _to_response(header)


@router.post("/{header_id}/reject", response_model=TimesheetHeaderResponse)
def reject(
    header_id: int,
    body: RejectAction,
    current_user=Depends(require_admin()),
    db: Session = Depends(get_db),
):
    header = ApprovalService(db).reject(header_id, current_user.id, body.comment)
    return _to_response(header)


@router.post("/{header_id}/unlock", response_model=TimesheetHeaderResponse)
def unlock(
    header_id: int,
    body: ApprovalAction,
    current_user=Depends(require_admin()),
    db: Session = Depends(get_db),
):
    header = ApprovalService(db).unlock(header_id, current_user.id, body.comment)
    return _to_response(header)


@router.get("/{header_id}/history")
def approval_history(
    header_id: int,
    _=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    return ApprovalService(db).get_thread(header_id)


@router.get("/all", response_model=PaginatedResponse)
def all_timesheets(
    employee_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    _=Depends(require_admin()),
    db: Session = Depends(get_db),
):
    repo = TimesheetHeaderRepository(db)
    from app.models.timesheet_header import TimesheetHeader, TimesheetStatus
    q = db.query(TimesheetHeader).filter(TimesheetHeader.is_deleted == False)
    if employee_id:
        q = q.filter(TimesheetHeader.employee_id == employee_id)
    if status:
        q = q.filter(TimesheetHeader.status == status)
    total = q.count()
    items = q.order_by(TimesheetHeader.week_start_date.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return PaginatedResponse(
        items=[_to_response(h) for h in items],
        total=total,
        page=page,
        page_size=page_size,
    )


def _to_response(header) -> TimesheetHeaderResponse:
    from app.schemas.timesheet import TimesheetHeaderResponse
    r = TimesheetHeaderResponse.model_validate(header)
    r.employee_name = header.employee.full_name if header.employee else None
    return r

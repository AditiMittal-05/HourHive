from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import Optional
from datetime import date
import io

from app.database.session import get_db
from app.api.deps import get_current_active_user
from app.core.permissions import require_admin
from app.services.report_service import ReportService
from app.services.export_service import ExportService

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/daily")
def daily_report(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    employee_id: Optional[int] = Query(None),
    project_id: Optional[int] = Query(None),
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    from app.models.user import UserRole
    eid = employee_id if current_user.role == UserRole.ADMIN else current_user.id
    return ReportService(db).get_daily(eid, project_id, start_date, end_date)


@router.get("/monthly-summary")
def monthly_summary(
    month: int = Query(..., ge=1, le=12),
    year: int = Query(..., ge=2020),
    employee_id: Optional[int] = Query(None),
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    from app.models.user import UserRole
    eid = employee_id if current_user.role == UserRole.ADMIN else current_user.id
    return ReportService(db).get_monthly_summary(month, year, eid)


@router.get("/project-effort")
def project_effort(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    project_id: Optional[int] = Query(None),
    _=Depends(require_admin()),
    db: Session = Depends(get_db),
):
    return ReportService(db).get_project_effort(start_date, end_date, project_id)


@router.get("/activity")
def activity_report(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    employee_id: Optional[int] = Query(None),
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    from app.models.user import UserRole
    eid = employee_id if current_user.role == UserRole.ADMIN else current_user.id
    return ReportService(db).get_activity_report(start_date, end_date, eid)


@router.get("/missing-timesheets")
def missing_timesheets(
    start_date: date = Query(...),
    end_date: date = Query(...),
    _=Depends(require_admin()),
    db: Session = Depends(get_db),
):
    return ReportService(db).get_missing_timesheets(start_date, end_date)


@router.get("/comparison")
def comparison(
    employee_id: int = Query(...),
    month1: int = Query(..., ge=1, le=12),
    year1: int = Query(...),
    month2: int = Query(..., ge=1, le=12),
    year2: int = Query(...),
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    from app.models.user import UserRole
    eid = employee_id if current_user.role == UserRole.ADMIN else current_user.id
    return ReportService(db).get_comparison(eid, month1, year1, month2, year2)


@router.get("/export/daily")
def export_daily(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    employee_id: Optional[int] = Query(None),
    project_id: Optional[int] = Query(None),
    fmt: str = Query("excel", regex="^(excel|pdf)$"),
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    from app.models.user import UserRole
    eid = employee_id if current_user.role == UserRole.ADMIN else current_user.id
    rows = ReportService(db).get_daily(eid, project_id, start_date, end_date)
    svc = ExportService()
    if fmt == "excel":
        buf = svc.export_daily_excel(rows)
        return StreamingResponse(buf, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                                 headers={"Content-Disposition": "attachment; filename=daily_report.xlsx"})
    buf = svc.export_daily_pdf(rows)
    return StreamingResponse(buf, media_type="application/pdf",
                             headers={"Content-Disposition": "attachment; filename=daily_report.pdf"})

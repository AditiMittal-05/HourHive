from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import date

from app.database.session import get_db
from app.api.deps import get_current_active_user
from app.schemas.timesheet import (
    TimesheetEntryCreate, TimesheetEntryUpdate, TimesheetEntryResponse,
    TimesheetHeaderResponse, CopyDayRequest, WeeklyGridResponse,
)
from app.schemas.common import PaginatedResponse
from app.services.timesheet_service import TimesheetService

router = APIRouter(prefix="/timesheets", tags=["Timesheet"])


@router.get("/weekly", response_model=WeeklyGridResponse)
def weekly_grid(
    week_start: date = Query(...),
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    return TimesheetService(db).get_weekly_grid(current_user.id, week_start)


@router.get("/daily", response_model=list[TimesheetEntryResponse])
def daily_entries(
    work_date: date = Query(...),
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    entries = TimesheetService(db).get_daily_entries(current_user.id, work_date)
    result = []
    for e in entries:
        r = TimesheetEntryResponse.model_validate(e)
        r.project_name = e.project.project_name if e.project else None
        r.project_code = e.project.project_code if e.project else None
        r.activity_name = e.activity.activity_name if e.activity else None
        result.append(r)
    return result


@router.post("/entries", response_model=TimesheetEntryResponse, status_code=201)
def add_entry(
    body: TimesheetEntryCreate,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    entry = TimesheetService(db).add_entry(current_user.id, body, created_by=current_user.id)
    r = TimesheetEntryResponse.model_validate(entry)
    r.project_name = entry.project.project_name if entry.project else None
    r.project_code = entry.project.project_code if entry.project else None
    r.activity_name = entry.activity.activity_name if entry.activity else None
    return r


@router.put("/entries/{detail_id}", response_model=TimesheetEntryResponse)
def update_entry(
    detail_id: int,
    body: TimesheetEntryUpdate,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    entry = TimesheetService(db).update_entry(detail_id, current_user.id, body, updated_by=current_user.id)
    r = TimesheetEntryResponse.model_validate(entry)
    r.project_name = entry.project.project_name if entry.project else None
    r.project_code = entry.project.project_code if entry.project else None
    r.activity_name = entry.activity.activity_name if entry.activity else None
    return r


@router.delete("/entries/{detail_id}", status_code=204)
def delete_entry(
    detail_id: int,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    TimesheetService(db).delete_entry(detail_id, current_user.id, deleted_by=current_user.id)


@router.post("/copy-day", response_model=list[TimesheetEntryResponse])
def copy_day(
    body: CopyDayRequest,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    entries = TimesheetService(db).copy_previous_day(
        current_user.id, body.from_date, body.to_date, created_by=current_user.id
    )
    result = []
    for e in entries:
        r = TimesheetEntryResponse.model_validate(e)
        r.project_name = e.project.project_name if e.project else None
        r.project_code = e.project.project_code if e.project else None
        r.activity_name = e.activity.activity_name if e.activity else None
        result.append(r)
    return result


@router.post("/headers/{header_id}/submit", response_model=TimesheetHeaderResponse)
def submit_timesheet(
    header_id: int,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    header = TimesheetService(db).submit_timesheet(header_id, current_user.id)
    return _header_to_response(header)


@router.get("/headers", response_model=PaginatedResponse)
def list_timesheets(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    items, total = TimesheetService(db).list_timesheets(current_user.id, page, page_size)
    return PaginatedResponse(
        items=[_header_to_response(h) for h in items],
        total=total,
        page=page,
        page_size=page_size,
    )


def _header_to_response(header) -> TimesheetHeaderResponse:
    r = TimesheetHeaderResponse.model_validate(header)
    r.employee_name = header.employee.full_name if header.employee else None
    return r

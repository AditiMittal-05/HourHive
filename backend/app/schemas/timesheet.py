from datetime import date, datetime
from typing import Optional, List
from decimal import Decimal
from pydantic import BaseModel, field_validator
from app.models.timesheet_header import TimesheetStatus


class TimesheetEntryCreate(BaseModel):
    project_id: int
    activity_id: int
    work_date: date
    hours_worked: Decimal
    description: Optional[str] = None
    is_billable: bool = True

    @field_validator("hours_worked")
    @classmethod
    def validate_hours(cls, v):
        # Must be in 0.25 increments
        remainder = float(v) % 0.25
        if round(remainder, 4) != 0.0:
            raise ValueError("Hours must be in 0.25 (15-minute) increments")
        if v <= 0:
            raise ValueError("Hours must be greater than 0")
        if v > 12:
            raise ValueError("Cannot exceed 12 hours per entry")
        return v


class TimesheetEntryUpdate(BaseModel):
    project_id: Optional[int] = None
    activity_id: Optional[int] = None
    hours_worked: Optional[Decimal] = None
    description: Optional[str] = None
    is_billable: Optional[bool] = None

    @field_validator("hours_worked")
    @classmethod
    def validate_hours(cls, v):
        if v is None:
            return v
        remainder = float(v) % 0.25
        if round(remainder, 4) != 0.0:
            raise ValueError("Hours must be in 0.25 increments")
        if v <= 0:
            raise ValueError("Hours must be greater than 0")
        return v


class TimesheetEntryResponse(BaseModel):
    id: int
    header_id: int
    employee_id: int
    project_id: int
    project_name: Optional[str] = None
    project_code: Optional[str] = None
    activity_id: int
    activity_name: Optional[str] = None
    work_date: date
    hours_worked: Decimal
    description: Optional[str] = None
    is_billable: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class TimesheetHeaderResponse(BaseModel):
    id: int
    employee_id: int
    employee_name: Optional[str] = None
    week_start_date: date
    week_end_date: date
    total_hours: Decimal
    status: TimesheetStatus
    submitted_at: Optional[datetime] = None
    approved_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    is_locked: bool
    details: List[TimesheetEntryResponse] = []
    created_at: datetime

    model_config = {"from_attributes": True}


class CopyDayRequest(BaseModel):
    from_date: date
    to_date: date


class WeeklyGridEntry(BaseModel):
    project_id: int
    project_name: str
    project_code: str
    activity_id: int
    activity_name: str
    mon: Optional[Decimal] = None
    tue: Optional[Decimal] = None
    wed: Optional[Decimal] = None
    thu: Optional[Decimal] = None
    fri: Optional[Decimal] = None
    sat: Optional[Decimal] = None
    sun: Optional[Decimal] = None
    row_total: Decimal = Decimal("0")


class WeeklyGridResponse(BaseModel):
    week_start_date: date
    week_end_date: date
    header_id: Optional[int] = None
    status: Optional[TimesheetStatus] = None
    entries: List[WeeklyGridEntry] = []
    day_totals: dict = {}
    grand_total: Decimal = Decimal("0")

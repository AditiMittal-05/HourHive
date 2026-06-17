from datetime import date
from typing import Optional, List
from pydantic import BaseModel
from decimal import Decimal


class ReportFilter(BaseModel):
    employee_id: Optional[int] = None
    project_id: Optional[int] = None
    activity_id: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    month: Optional[int] = None
    year: Optional[int] = None


class DailyReportRow(BaseModel):
    work_date: date
    employee_name: str
    employee_code: str
    project_name: str
    activity_name: str
    hours_worked: Decimal
    description: Optional[str] = None
    is_billable: bool


class MonthlySummaryRow(BaseModel):
    employee_name: str
    employee_code: str
    total_hours: Decimal
    working_days: int
    avg_daily_hours: Decimal


class ProjectEffortRow(BaseModel):
    project_name: str
    project_code: str
    customer_name: str
    total_hours: Decimal
    billable_hours: Decimal
    non_billable_hours: Decimal


class ActivityReportRow(BaseModel):
    activity_name: str
    total_hours: Decimal
    percentage: float


class MissingTimesheetRow(BaseModel):
    employee_name: str
    employee_code: str
    missing_dates: List[str]
    missing_days_count: int


class ComparisonRow(BaseModel):
    label: str
    month1_hours: Decimal
    month2_hours: Decimal
    difference: Decimal
    percentage_change: Optional[float] = None


class ExportRequest(BaseModel):
    report_type: str
    filters: ReportFilter
    format: str = "excel"

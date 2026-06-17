from typing import List, Optional
from decimal import Decimal
from pydantic import BaseModel


class EmployeeKPIs(BaseModel):
    current_month_hours: Decimal
    submitted_count: int
    pending_count: int
    approved_count: int
    rejected_count: int


class AdminKPIs(BaseModel):
    pending_approvals: int
    approved_this_month: int
    rejected_this_month: int
    missing_timesheets: int
    total_employees: int
    avg_hours_per_employee: Decimal


class ChartDataPoint(BaseModel):
    label: str
    value: float


class WeeklyHoursData(BaseModel):
    week: str
    hours: float


class RecentEntry(BaseModel):
    work_date: str
    project_name: str
    activity_name: str
    hours_worked: float
    status: str


class HeatmapDay(BaseModel):
    date: str
    hours: float
    status: Optional[str] = None


class EmployeeDashboard(BaseModel):
    kpis: EmployeeKPIs
    weekly_hours: List[WeeklyHoursData]
    recent_entries: List[RecentEntry]
    heatmap: List[HeatmapDay]


class TopProject(BaseModel):
    project_name: str
    total_hours: float


class PendingItem(BaseModel):
    header_id: int
    employee_name: str
    week_label: str
    total_hours: float
    submitted_at: Optional[str] = None


class AdminDashboard(BaseModel):
    kpis: AdminKPIs
    top_projects: List[TopProject]
    pending_approvals: List[PendingItem]
    monthly_hours_chart: List[ChartDataPoint]

from datetime import date
from decimal import Decimal
from sqlalchemy.orm import Session
from app.repositories.report_repository import ReportRepository
from app.schemas.report import (
    DailyReportRow, MonthlySummaryRow, ProjectEffortRow,
    ActivityReportRow, MissingTimesheetRow, ComparisonRow,
)
from app.utils.date_utils import get_month_date_range, working_days_in_range


class ReportService:
    def __init__(self, db: Session):
        self.repo = ReportRepository(db)
        self.db = db

    def get_daily(self, employee_id=None, project_id=None, start_date=None, end_date=None):
        rows = self.repo.get_daily_report(employee_id, project_id, start_date, end_date)
        return [
            DailyReportRow(
                work_date=r.TimesheetDetail.work_date,
                employee_name=r.employee_name,
                employee_code=r.employee_code,
                project_name=r.project_name,
                activity_name=r.activity_name,
                hours_worked=r.TimesheetDetail.hours_worked,
                description=r.TimesheetDetail.description,
                is_billable=r.TimesheetDetail.is_billable,
            )
            for r in rows
        ]

    def get_monthly_summary(self, month: int, year: int, employee_id=None):
        rows = self.repo.get_monthly_summary(month, year, employee_id)
        result = []
        for r in rows:
            avg = Decimal(str(r.total_hours)) / r.working_days if r.working_days else Decimal("0")
            result.append(MonthlySummaryRow(
                employee_name=r.full_name,
                employee_code=r.employee_code,
                total_hours=Decimal(str(r.total_hours)),
                working_days=r.working_days,
                avg_daily_hours=round(avg, 2),
            ))
        return result

    def get_project_effort(self, start_date=None, end_date=None, project_id=None):
        rows = self.repo.get_project_effort(start_date, end_date, project_id)
        return [
            ProjectEffortRow(
                project_name=r.project_name,
                project_code=r.project_code,
                customer_name=r.customer_name,
                total_hours=Decimal(str(r.total_hours)),
                billable_hours=Decimal(str(r.billable_hours or 0)),
                non_billable_hours=Decimal(str(r.total_hours)) - Decimal(str(r.billable_hours or 0)),
            )
            for r in rows
        ]

    def get_activity_report(self, start_date=None, end_date=None, employee_id=None):
        rows = self.repo.get_activity_report(start_date, end_date, employee_id)
        grand_total = sum(float(r.total_hours) for r in rows) or 1
        return [
            ActivityReportRow(
                activity_name=r.activity_name,
                total_hours=Decimal(str(r.total_hours)),
                percentage=round(float(r.total_hours) / grand_total * 100, 1),
            )
            for r in rows
        ]

    def get_missing_timesheets(self, start_date: date, end_date: date):
        users = self.repo.get_missing_timesheets(start_date, end_date)
        total_days = working_days_in_range(start_date, end_date)
        result = []
        for u in users:
            missing_dates = []
            current = start_date
            from datetime import timedelta
            while current <= end_date:
                if current.weekday() < 5:
                    missing_dates.append(str(current))
                current += timedelta(days=1)
            result.append(MissingTimesheetRow(
                employee_name=u.full_name,
                employee_code=u.employee_code,
                missing_dates=missing_dates,
                missing_days_count=len(missing_dates),
            ))
        return result

    def get_comparison(self, employee_id: int, month1: int, year1: int, month2: int, year2: int):
        r1 = self.repo.get_monthly_summary(month1, year1, employee_id)
        r2 = self.repo.get_monthly_summary(month2, year2, employee_id)
        h1 = Decimal(str(r1[0].total_hours)) if r1 else Decimal("0")
        h2 = Decimal(str(r2[0].total_hours)) if r2 else Decimal("0")
        diff = h2 - h1
        pct = round(float(diff) / float(h1) * 100, 1) if h1 != 0 else None
        import calendar
        return ComparisonRow(
            label=f"{calendar.month_abbr[month1]} {year1} vs {calendar.month_abbr[month2]} {year2}",
            month1_hours=h1,
            month2_hours=h2,
            difference=diff,
            percentage_change=pct,
        )

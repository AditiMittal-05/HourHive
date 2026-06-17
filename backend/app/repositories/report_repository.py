from datetime import date
from typing import List, Optional
from decimal import Decimal
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, extract
from app.models.timesheet_detail import TimesheetDetail
from app.models.timesheet_header import TimesheetHeader, TimesheetStatus
from app.models.user import User, UserStatus
from app.models.project import Project
from app.models.activity import Activity


class ReportRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_daily_report(self, employee_id: int = None, project_id: int = None,
                         start_date: date = None, end_date: date = None):
        q = self.db.query(
            TimesheetDetail,
            User.full_name.label("employee_name"),
            User.employee_code,
            Project.project_name,
            Activity.activity_name,
        ).join(User, TimesheetDetail.employee_id == User.id)\
         .join(Project, TimesheetDetail.project_id == Project.id)\
         .join(Activity, TimesheetDetail.activity_id == Activity.id)\
         .filter(TimesheetDetail.is_deleted == False)

        if employee_id:
            q = q.filter(TimesheetDetail.employee_id == employee_id)
        if project_id:
            q = q.filter(TimesheetDetail.project_id == project_id)
        if start_date:
            q = q.filter(TimesheetDetail.work_date >= start_date)
        if end_date:
            q = q.filter(TimesheetDetail.work_date <= end_date)

        return q.order_by(TimesheetDetail.work_date.desc()).all()

    def get_monthly_summary(self, month: int, year: int, employee_id: int = None):
        q = self.db.query(
            User.id,
            User.full_name,
            User.employee_code,
            func.sum(TimesheetDetail.hours_worked).label("total_hours"),
            func.count(func.distinct(TimesheetDetail.work_date)).label("working_days"),
        ).join(TimesheetDetail, User.id == TimesheetDetail.employee_id)\
         .filter(
            TimesheetDetail.is_deleted == False,
            extract("month", TimesheetDetail.work_date) == month,
            extract("year", TimesheetDetail.work_date) == year,
         )
        if employee_id:
            q = q.filter(User.id == employee_id)
        return q.group_by(User.id, User.full_name, User.employee_code).all()

    def get_project_effort(self, start_date: date = None, end_date: date = None, project_id: int = None):
        q = self.db.query(
            Project.id,
            Project.project_name,
            Project.project_code,
            Project.customer_name,
            func.sum(TimesheetDetail.hours_worked).label("total_hours"),
            func.sum(
                func.IF(TimesheetDetail.is_billable == True, TimesheetDetail.hours_worked, 0)
            ).label("billable_hours"),
        ).join(TimesheetDetail, Project.id == TimesheetDetail.project_id)\
         .filter(TimesheetDetail.is_deleted == False)
        if start_date:
            q = q.filter(TimesheetDetail.work_date >= start_date)
        if end_date:
            q = q.filter(TimesheetDetail.work_date <= end_date)
        if project_id:
            q = q.filter(Project.id == project_id)
        return q.group_by(Project.id, Project.project_name, Project.project_code, Project.customer_name).all()

    def get_activity_report(self, start_date: date = None, end_date: date = None, employee_id: int = None):
        q = self.db.query(
            Activity.activity_name,
            func.sum(TimesheetDetail.hours_worked).label("total_hours"),
        ).join(TimesheetDetail, Activity.id == TimesheetDetail.activity_id)\
         .filter(TimesheetDetail.is_deleted == False)
        if start_date:
            q = q.filter(TimesheetDetail.work_date >= start_date)
        if end_date:
            q = q.filter(TimesheetDetail.work_date <= end_date)
        if employee_id:
            q = q.filter(TimesheetDetail.employee_id == employee_id)
        return q.group_by(Activity.activity_name).all()

    def get_missing_timesheets(self, start_date: date, end_date: date):
        """Returns employees with no timesheet entries in the given range."""
        employees_with_entries = self.db.query(
            TimesheetDetail.employee_id
        ).filter(
            TimesheetDetail.work_date >= start_date,
            TimesheetDetail.work_date <= end_date,
            TimesheetDetail.is_deleted == False,
        ).distinct().subquery()

        missing = self.db.query(User).filter(
            User.status == UserStatus.ACTIVE,
            User.is_deleted == False,
            ~User.id.in_(employees_with_entries),
        ).all()
        return missing

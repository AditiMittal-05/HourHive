from datetime import date, timedelta
from typing import Optional, List, Tuple
from decimal import Decimal
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, func
from app.models.timesheet_header import TimesheetHeader, TimesheetStatus
from app.models.timesheet_detail import TimesheetDetail
from app.repositories.base_repository import BaseRepository


class TimesheetHeaderRepository(BaseRepository[TimesheetHeader]):
    def __init__(self, db: Session):
        super().__init__(TimesheetHeader, db)

    def get_by_employee_and_week(self, employee_id: int, week_start: date) -> Optional[TimesheetHeader]:
        return self.db.query(TimesheetHeader).filter(
            TimesheetHeader.employee_id == employee_id,
            TimesheetHeader.week_start_date == week_start,
            TimesheetHeader.is_deleted == False,
        ).first()

    def get_with_details(self, header_id: int) -> Optional[TimesheetHeader]:
        return self.db.query(TimesheetHeader).options(
            joinedload(TimesheetHeader.details)
        ).filter(TimesheetHeader.id == header_id, TimesheetHeader.is_deleted == False).first()

    def list_for_employee(self, employee_id: int, page: int = 1, page_size: int = 10) -> Tuple[List[TimesheetHeader], int]:
        q = self.db.query(TimesheetHeader).filter(
            TimesheetHeader.employee_id == employee_id,
            TimesheetHeader.is_deleted == False,
        ).order_by(TimesheetHeader.week_start_date.desc())
        total = q.count()
        items = q.offset((page - 1) * page_size).limit(page_size).all()
        return items, total

    def get_pending_approvals(self, page: int = 1, page_size: int = 20) -> Tuple[List[TimesheetHeader], int]:
        q = self.db.query(TimesheetHeader).filter(
            TimesheetHeader.status.in_([TimesheetStatus.SUBMITTED, TimesheetStatus.RESUBMITTED]),
            TimesheetHeader.is_deleted == False,
        ).order_by(TimesheetHeader.submitted_at.asc())
        total = q.count()
        items = q.offset((page - 1) * page_size).limit(page_size).all()
        return items, total

    def recalculate_total(self, header: TimesheetHeader) -> None:
        total = self.db.query(func.sum(TimesheetDetail.hours_worked)).filter(
            TimesheetDetail.header_id == header.id,
            TimesheetDetail.is_deleted == False,
        ).scalar() or Decimal("0")
        header.total_hours = total
        self.db.commit()


class TimesheetDetailRepository(BaseRepository[TimesheetDetail]):
    def __init__(self, db: Session):
        super().__init__(TimesheetDetail, db)

    def get_by_date(self, employee_id: int, work_date: date) -> List[TimesheetDetail]:
        return self.db.query(TimesheetDetail).filter(
            TimesheetDetail.employee_id == employee_id,
            TimesheetDetail.work_date == work_date,
            TimesheetDetail.is_deleted == False,
        ).all()

    def get_by_header(self, header_id: int) -> List[TimesheetDetail]:
        return self.db.query(TimesheetDetail).filter(
            TimesheetDetail.header_id == header_id,
            TimesheetDetail.is_deleted == False,
        ).order_by(TimesheetDetail.work_date).all()

    def get_hours_for_date(self, employee_id: int, work_date: date) -> Decimal:
        result = self.db.query(func.sum(TimesheetDetail.hours_worked)).filter(
            TimesheetDetail.employee_id == employee_id,
            TimesheetDetail.work_date == work_date,
            TimesheetDetail.is_deleted == False,
        ).scalar()
        return result or Decimal("0")

    def get_week_entries(self, employee_id: int, week_start: date, week_end: date) -> List[TimesheetDetail]:
        return self.db.query(TimesheetDetail).filter(
            TimesheetDetail.employee_id == employee_id,
            TimesheetDetail.work_date >= week_start,
            TimesheetDetail.work_date <= week_end,
            TimesheetDetail.is_deleted == False,
        ).order_by(TimesheetDetail.work_date).all()

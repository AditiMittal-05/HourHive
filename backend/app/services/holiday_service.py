from datetime import date as DateType
from sqlalchemy.orm import Session
from app.models.holiday import Holiday
from app.repositories.holiday_repository import HolidayRepository
from app.core.exceptions import BusinessRuleException


class HolidayService:
    def __init__(self, db: Session):
        self.repo = HolidayRepository(db)

    def get_by_year(self, year: int):
        return self.repo.get_by_year(year)

    def create(self, date: DateType, name: str, created_by: int) -> Holiday:
        existing = self.repo.get_by_date(date)
        if existing:
            raise BusinessRuleException(f"A holiday already exists on {date}: '{existing.name}'")
        holiday = Holiday(
            date=date,
            name=name.strip(),
            year=date.year,
            created_by=created_by,
        )
        return self.repo.save(holiday)

    def delete(self, holiday_id: int, deleted_by: int) -> None:
        holiday = self.repo.get(holiday_id)
        if not holiday or holiday.is_deleted:
            raise BusinessRuleException("Holiday not found")
        self.repo.soft_delete(holiday, deleted_by)

from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.holiday import Holiday
from app.repositories.base_repository import BaseRepository


class HolidayRepository(BaseRepository[Holiday]):
    def __init__(self, db: Session):
        super().__init__(Holiday, db)

    def get_by_year(self, year: int) -> List[Holiday]:
        return (
            self.db.query(Holiday)
            .filter(Holiday.year == year, Holiday.is_deleted == False)
            .order_by(Holiday.date)
            .all()
        )

    def get_by_date(self, date_str: str) -> Optional[Holiday]:
        from datetime import date
        return (
            self.db.query(Holiday)
            .filter(Holiday.date == date_str, Holiday.is_deleted == False)
            .first()
        )

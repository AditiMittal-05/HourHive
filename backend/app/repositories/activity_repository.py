from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.activity import Activity, ActivityStatus
from app.repositories.base_repository import BaseRepository


class ActivityRepository(BaseRepository[Activity]):
    def __init__(self, db: Session):
        super().__init__(Activity, db)

    def get_by_code(self, code: str) -> Optional[Activity]:
        return self.db.query(Activity).filter(Activity.activity_code == code, Activity.is_deleted == False).first()

    def get_active(self) -> List[Activity]:
        return self.db.query(Activity).filter(
            Activity.is_deleted == False, Activity.status == ActivityStatus.ACTIVE
        ).order_by(Activity.activity_name).all()

    def get_all_not_deleted(self) -> List[Activity]:
        return self.db.query(Activity).filter(Activity.is_deleted == False).order_by(Activity.activity_name).all()

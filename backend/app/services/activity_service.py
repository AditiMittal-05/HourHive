from sqlalchemy.orm import Session
from app.core.exceptions import ConflictException, NotFoundException
from app.repositories.activity_repository import ActivityRepository
from app.models.activity import Activity, ActivityStatus
from app.schemas.activity import ActivityCreate, ActivityUpdate


class ActivityService:
    def __init__(self, db: Session):
        self.repo = ActivityRepository(db)
        self.db = db

    def create(self, data: ActivityCreate, created_by: int) -> Activity:
        if self.repo.get_by_code(data.activity_code):
            raise ConflictException(f"Activity code {data.activity_code} already exists")
        activity = Activity(
            activity_code=data.activity_code,
            activity_name=data.activity_name,
            category=data.category,
            is_billable=data.is_billable,
            status=ActivityStatus.ACTIVE,
            created_by=created_by,
            updated_by=created_by,
        )
        return self.repo.save(activity)

    def update(self, activity_id: int, data: ActivityUpdate, updated_by: int) -> Activity:
        activity = self.repo.get(activity_id)
        if not activity or activity.is_deleted:
            raise NotFoundException("Activity not found")
        for field, value in data.model_dump(exclude_none=True).items():
            setattr(activity, field, value)
        activity.updated_by = updated_by
        self.db.commit()
        self.db.refresh(activity)
        return activity

    def toggle_status(self, activity_id: int, status: ActivityStatus, updated_by: int) -> Activity:
        activity = self.repo.get(activity_id)
        if not activity or activity.is_deleted:
            raise NotFoundException("Activity not found")
        activity.status = status
        activity.updated_by = updated_by
        self.db.commit()
        self.db.refresh(activity)
        return activity

    def get_all(self):
        return self.repo.get_all_not_deleted()

    def get_active(self):
        return self.repo.get_active()

from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.models.activity import ActivityStatus


class ActivityBase(BaseModel):
    activity_name: str
    category: Optional[str] = None
    is_billable: bool = True


class ActivityCreate(ActivityBase):
    activity_code: str


class ActivityUpdate(BaseModel):
    activity_name: Optional[str] = None
    category: Optional[str] = None
    is_billable: Optional[bool] = None
    status: Optional[ActivityStatus] = None


class ActivityResponse(ActivityBase):
    id: int
    activity_code: str
    status: ActivityStatus
    created_at: datetime

    model_config = {"from_attributes": True}

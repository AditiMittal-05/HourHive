from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.models.notification_log import NotificationType


class NotificationResponse(BaseModel):
    id: int
    type: NotificationType
    subject: str
    body: Optional[str] = None
    is_read: bool
    sent_at: datetime
    read_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class UnreadCountResponse(BaseModel):
    count: int

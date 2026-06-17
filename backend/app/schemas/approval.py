from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel
from app.models.approval_history import ApprovalAction


class ApproveRequest(BaseModel):
    comment: Optional[str] = None


class RejectRequest(BaseModel):
    comment: str  # mandatory


class UnlockRequest(BaseModel):
    comment: Optional[str] = None


class ApprovalHistoryResponse(BaseModel):
    id: int
    header_id: int
    action_by: int
    actor_name: Optional[str] = None
    action: ApprovalAction
    comment: Optional[str] = None
    previous_status: Optional[str] = None
    new_status: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ApprovalQueueItem(BaseModel):
    header_id: int
    employee_id: int
    employee_name: str
    employee_code: str
    week_start_date: str
    week_end_date: str
    total_hours: float
    status: str
    submitted_at: Optional[datetime] = None

    model_config = {"from_attributes": True}

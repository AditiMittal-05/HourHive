import math
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional
from pydantic import BaseModel

from app.database.session import get_db
from app.core.permissions import require_super_admin
from app.services.audit_service import AuditService

router = APIRouter(prefix="/audit-logs", tags=["Audit Logs"])


class AuditLogResponse(BaseModel):
    id: int
    user_id: Optional[int]
    actor_name: Optional[str] = None
    entity_type: str
    entity_id: Optional[int]
    action: str
    old_values: Optional[dict]
    new_values: Optional[dict]
    ip_address: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class AuditLogPaged(BaseModel):
    items: list[AuditLogResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


@router.get("", response_model=AuditLogPaged)
def list_audit_logs(
    entity_type: Optional[str] = Query(None),
    entity_id: Optional[int] = Query(None),
    user_id: Optional[int] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(30, ge=1, le=100),
    _=Depends(require_super_admin()),
    db: Session = Depends(get_db),
):
    items, total = AuditService(db).get_logs(entity_type, entity_id, user_id, page, page_size)
    rows = []
    for log in items:
        rows.append(AuditLogResponse(
            id=log.id,
            user_id=log.user_id,
            actor_name=log.actor.full_name if log.actor else None,
            entity_type=log.entity_type,
            entity_id=log.entity_id,
            action=log.action,
            old_values=log.old_values,
            new_values=log.new_values,
            ip_address=log.ip_address,
            created_at=log.created_at,
        ))
    return AuditLogPaged(
        items=rows,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=math.ceil(total / page_size) if page_size else 1,
    )

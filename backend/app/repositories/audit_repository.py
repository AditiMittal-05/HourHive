from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog
from app.repositories.base_repository import BaseRepository


class AuditRepository(BaseRepository[AuditLog]):
    def __init__(self, db: Session):
        super().__init__(AuditLog, db)

    def log(self, user_id: Optional[int], entity_type: str, entity_id: Optional[int],
            action: str, old_values: dict = None, new_values: dict = None,
            ip_address: str = None, user_agent: str = None) -> AuditLog:
        entry = AuditLog(
            user_id=user_id,
            entity_type=entity_type,
            entity_id=entity_id,
            action=action,
            old_values=old_values,
            new_values=new_values,
            ip_address=ip_address,
            user_agent=user_agent,
        )
        self.db.add(entry)
        self.db.commit()
        return entry

    def search(self, entity_type: str = None, entity_id: int = None, user_id: int = None,
               page: int = 1, page_size: int = 50) -> Tuple[List[AuditLog], int]:
        q = self.db.query(AuditLog)
        if entity_type:
            q = q.filter(AuditLog.entity_type == entity_type)
        if entity_id:
            q = q.filter(AuditLog.entity_id == entity_id)
        if user_id:
            q = q.filter(AuditLog.user_id == user_id)
        total = q.count()
        items = q.order_by(AuditLog.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
        return items, total

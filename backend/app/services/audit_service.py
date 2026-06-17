from typing import Optional
from sqlalchemy.orm import Session
from app.repositories.audit_repository import AuditRepository


class AuditService:
    def __init__(self, db: Session):
        self.repo = AuditRepository(db)

    def log(self, user_id: Optional[int], entity_type: str, entity_id: Optional[int],
            action: str, old_values: dict = None, new_values: dict = None,
            ip_address: str = None, user_agent: str = None):
        return self.repo.log(
            user_id=user_id, entity_type=entity_type, entity_id=entity_id,
            action=action, old_values=old_values, new_values=new_values,
            ip_address=ip_address, user_agent=user_agent,
        )

    def get_logs(self, entity_type: str = None, entity_id: int = None,
                 user_id: int = None, page: int = 1, page_size: int = 50):
        items, total = self.repo.search(entity_type, entity_id, user_id, page, page_size)
        return items, total

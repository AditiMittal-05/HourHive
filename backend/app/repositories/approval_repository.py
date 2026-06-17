from typing import List
from sqlalchemy.orm import Session, joinedload
from app.models.approval_history import ApprovalHistory
from app.repositories.base_repository import BaseRepository


class ApprovalRepository(BaseRepository[ApprovalHistory]):
    def __init__(self, db: Session):
        super().__init__(ApprovalHistory, db)

    def get_thread(self, header_id: int) -> List[ApprovalHistory]:
        return self.db.query(ApprovalHistory).filter(
            ApprovalHistory.header_id == header_id
        ).order_by(ApprovalHistory.created_at.asc()).all()

    def create_entry(self, header_id: int, action_by: int, action, comment: str = None,
                     previous_status: str = None, new_status: str = None) -> ApprovalHistory:
        entry = ApprovalHistory(
            header_id=header_id,
            action_by=action_by,
            action=action,
            comment=comment,
            previous_status=previous_status,
            new_status=new_status,
        )
        self.db.add(entry)
        self.db.commit()
        self.db.refresh(entry)
        return entry

from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.core.exceptions import NotFoundException, BusinessRuleException
from app.repositories.timesheet_repository import TimesheetHeaderRepository
from app.repositories.approval_repository import ApprovalRepository
from app.models.timesheet_header import TimesheetHeader, TimesheetStatus
from app.models.approval_history import ApprovalAction


class ApprovalService:
    def __init__(self, db: Session):
        self.header_repo = TimesheetHeaderRepository(db)
        self.approval_repo = ApprovalRepository(db)
        self.db = db

    def _get_header(self, header_id: int) -> TimesheetHeader:
        h = self.header_repo.get(header_id)
        if not h or h.is_deleted:
            raise NotFoundException("Timesheet not found")
        return h

    def approve(self, header_id: int, admin_id: int, comment: str = None) -> TimesheetHeader:
        header = self._get_header(header_id)
        if header.status not in [TimesheetStatus.SUBMITTED, TimesheetStatus.RESUBMITTED]:
            raise BusinessRuleException("Only submitted timesheets can be approved")
        prev = header.status.value
        header.status = TimesheetStatus.APPROVED
        header.approved_by = admin_id
        header.approved_at = datetime.now(timezone.utc)
        header.is_locked = True
        header.updated_by = admin_id
        self.db.commit()
        self.approval_repo.create_entry(header_id, admin_id, ApprovalAction.APPROVE,
                                        comment, prev, TimesheetStatus.APPROVED.value)
        self.db.refresh(header)
        return header

    def reject(self, header_id: int, admin_id: int, comment: str) -> TimesheetHeader:
        if not comment or not comment.strip():
            raise BusinessRuleException("Rejection comment is mandatory")
        header = self._get_header(header_id)
        if header.status not in [TimesheetStatus.SUBMITTED, TimesheetStatus.RESUBMITTED]:
            raise BusinessRuleException("Only submitted timesheets can be rejected")
        prev = header.status.value
        header.status = TimesheetStatus.REJECTED
        header.rejected_by = admin_id
        header.rejection_reason = comment
        header.is_locked = False
        header.updated_by = admin_id
        self.db.commit()
        self.approval_repo.create_entry(header_id, admin_id, ApprovalAction.REJECT,
                                        comment, prev, TimesheetStatus.REJECTED.value)
        self.db.refresh(header)
        return header

    def unlock(self, header_id: int, admin_id: int, comment: str = None) -> TimesheetHeader:
        header = self._get_header(header_id)
        if header.status != TimesheetStatus.APPROVED:
            raise BusinessRuleException("Only approved timesheets can be unlocked")
        header.is_locked = False
        header.status = TimesheetStatus.DRAFT
        header.updated_by = admin_id
        self.db.commit()
        self.approval_repo.create_entry(header_id, admin_id, ApprovalAction.UNLOCK,
                                        comment, TimesheetStatus.APPROVED.value, TimesheetStatus.DRAFT.value)
        self.db.refresh(header)
        return header

    def get_pending(self, page: int = 1, page_size: int = 20):
        return self.header_repo.get_pending_approvals(page, page_size)

    def get_thread(self, header_id: int):
        return self.approval_repo.get_thread(header_id)

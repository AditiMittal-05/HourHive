from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.user import User, UserRole, UserStatus
from app.repositories.base_repository import BaseRepository


class UserRepository(BaseRepository[User]):
    def __init__(self, db: Session):
        super().__init__(User, db)

    def get_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(User.email == email, User.is_deleted == False).first()

    def get_by_employee_code(self, code: str) -> Optional[User]:
        return self.db.query(User).filter(User.employee_code == code, User.is_deleted == False).first()

    def get_active_by_id(self, id: int) -> Optional[User]:
        return self.db.query(User).filter(
            User.id == id, User.is_deleted == False, User.status == UserStatus.ACTIVE
        ).first()

    def search(
        self, search: str = None, role: UserRole = None, status: UserStatus = None,
        page: int = 1, page_size: int = 20, exclude_super_admin: bool = False,
    ) -> Tuple[List[User], int]:
        q = self.db.query(User).filter(User.is_deleted == False)
        if exclude_super_admin:
            q = q.filter(User.role != UserRole.SUPER_ADMIN)
        if search:
            q = q.filter(or_(
                User.full_name.ilike(f"%{search}%"),
                User.email.ilike(f"%{search}%"),
                User.employee_code.ilike(f"%{search}%"),
            ))
        if role:
            q = q.filter(User.role == role)
        if status:
            q = q.filter(User.status == status)
        total = q.count()
        items = q.order_by(User.full_name).offset((page - 1) * page_size).limit(page_size).all()
        return items, total

    def get_all_active_employees(self) -> List[User]:
        return self.db.query(User).filter(
            User.is_deleted == False, User.status == UserStatus.ACTIVE
        ).order_by(User.full_name).all()

    def get_by_reset_token(self, token: str) -> Optional[User]:
        return self.db.query(User).filter(User.password_reset_token == token).first()

    def get_direct_reports(self, manager_id: int) -> List[User]:
        return self.db.query(User).filter(
            User.manager_id == manager_id,
            User.is_deleted == False,
        ).order_by(User.full_name).all()

    def get_approvers(self) -> List[User]:
        return self.db.query(User).filter(
            User.can_approve_timesheets == True,
            User.is_deleted == False,
            User.status == UserStatus.ACTIVE,
        ).order_by(User.full_name).all()

    def get_org_tree(self) -> List[User]:
        """All non-super_admin users with hierarchy info loaded."""
        return self.db.query(User).filter(
            User.is_deleted == False,
            User.role != UserRole.SUPER_ADMIN,
        ).order_by(User.full_name).all()

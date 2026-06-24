import secrets
import string
from typing import Optional, List
from sqlalchemy.orm import Session
from app.core.security import get_password_hash
from app.core.exceptions import ConflictException, NotFoundException, BusinessRuleException
from app.core.permissions import guard_super_admin_target, can_manage_role
from app.repositories.user_repository import UserRepository
from app.models.user import User, UserRole, UserStatus
from app.schemas.user import UserCreate, UserUpdate
from app.services.audit_service import AuditService


def _generate_temp_password(length: int = 12) -> str:
    chars = string.ascii_letters + string.digits + "!@#$"
    return "".join(secrets.choice(chars) for _ in range(length))


class UserService:
    def __init__(self, db: Session):
        self.repo = UserRepository(db)
        self.db = db

    def create(self, data: UserCreate, created_by: int, actor_role: UserRole) -> tuple[User, str]:
        if not can_manage_role(actor_role, data.role):
            raise BusinessRuleException(
                f"You do not have permission to create users with role '{data.role}'."
            )
        if self.repo.get_by_email(data.email):
            raise ConflictException(f"Email {data.email} already registered")
        if self.repo.get_by_employee_code(data.employee_code):
            raise ConflictException(f"Employee code {data.employee_code} already exists")
        temp_password = _generate_temp_password()
        user = User(
            employee_code=data.employee_code,
            full_name=data.full_name,
            email=data.email,
            password_hash=get_password_hash(temp_password),
            role=data.role,
            department=data.department,
            designation=data.designation,
            phone=data.phone,
            status=UserStatus.ACTIVE,
            created_by=created_by,
            updated_by=created_by,
        )
        saved = self.repo.save(user)
        AuditService(self.db).log(
            user_id=created_by,
            entity_type="User",
            entity_id=saved.id,
            action="CREATE",
            new_values={"role": data.role.value, "email": data.email, "employee_code": data.employee_code},
        )
        return saved, temp_password

    def update(self, user_id: int, data: UserUpdate, updated_by: int, actor_role: UserRole) -> User:
        user = self.repo.get(user_id)
        if not user or user.is_deleted:
            raise NotFoundException("User not found")
        guard_super_admin_target(user)
        if data.email and data.email != user.email:
            if self.repo.get_by_email(data.email):
                raise ConflictException("Email already in use")
        old = {"status": user.status.value, "email": user.email}
        for field, value in data.model_dump(exclude_none=True).items():
            setattr(user, field, value)
        user.updated_by = updated_by
        self.db.commit()
        self.db.refresh(user)
        AuditService(self.db).log(
            user_id=updated_by,
            entity_type="User",
            entity_id=user_id,
            action="UPDATE",
            old_values=old,
            new_values=data.model_dump(exclude_none=True),
        )
        return user

    def toggle_status(self, user_id: int, status: UserStatus, updated_by: int) -> User:
        user = self.repo.get(user_id)
        if not user or user.is_deleted:
            raise NotFoundException("User not found")
        guard_super_admin_target(user)
        old_status = user.status.value
        user.status = status
        user.updated_by = updated_by
        self.db.commit()
        self.db.refresh(user)
        AuditService(self.db).log(
            user_id=updated_by,
            entity_type="User",
            entity_id=user_id,
            action="STATUS_CHANGE",
            old_values={"status": old_status},
            new_values={"status": status.value},
        )
        return user

    def set_manager(self, user_id: int, manager_id: Optional[int], updated_by: int) -> User:
        user = self.repo.get(user_id)
        if not user or user.is_deleted:
            raise NotFoundException("User not found")
        guard_super_admin_target(user)
        if manager_id is not None:
            if manager_id == user_id:
                raise BusinessRuleException("A user cannot be their own manager.")
            manager = self.repo.get(manager_id)
            if not manager or manager.is_deleted:
                raise NotFoundException("Manager not found")
        user.manager_id = manager_id
        user.updated_by = updated_by
        self.db.commit()
        self.db.refresh(user)
        AuditService(self.db).log(
            user_id=updated_by, entity_type="User", entity_id=user_id,
            action="SET_MANAGER", new_values={"manager_id": manager_id},
        )
        return user

    def toggle_approver(self, user_id: int, can_approve: bool, updated_by: int) -> User:
        user = self.repo.get(user_id)
        if not user or user.is_deleted:
            raise NotFoundException("User not found")
        guard_super_admin_target(user)
        user.can_approve_timesheets = can_approve
        user.updated_by = updated_by
        self.db.commit()
        self.db.refresh(user)
        AuditService(self.db).log(
            user_id=updated_by, entity_type="User", entity_id=user_id,
            action="TOGGLE_APPROVER", new_values={"can_approve_timesheets": can_approve},
        )
        return user

    def get_detail(self, user_id: int) -> User:
        user = self.repo.get(user_id)
        if not user or user.is_deleted:
            raise NotFoundException("User not found")
        return user

    def search(self, search: str = None, role: UserRole = None, status: UserStatus = None,
               page: int = 1, page_size: int = 20, exclude_super_admin: bool = False):
        return self.repo.search(search, role, status, page, page_size,
                                exclude_super_admin=exclude_super_admin)

    def get_dropdown(self):
        return self.repo.get_all_active_employees()

    def get_approvers(self) -> List[User]:
        return self.repo.get_approvers()

    def get_org_tree(self) -> List[User]:
        return self.repo.get_org_tree()

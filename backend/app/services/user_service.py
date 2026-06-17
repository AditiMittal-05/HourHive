import secrets
import string
from typing import Optional
from sqlalchemy.orm import Session
from app.core.security import get_password_hash
from app.core.exceptions import ConflictException, NotFoundException
from app.repositories.user_repository import UserRepository
from app.models.user import User, UserRole, UserStatus
from app.schemas.user import UserCreate, UserUpdate


def _generate_temp_password(length: int = 12) -> str:
    chars = string.ascii_letters + string.digits + "!@#$"
    return "".join(secrets.choice(chars) for _ in range(length))


class UserService:
    def __init__(self, db: Session):
        self.repo = UserRepository(db)
        self.db = db

    def create(self, data: UserCreate, created_by: int) -> tuple[User, str]:
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
        return self.repo.save(user), temp_password

    def update(self, user_id: int, data: UserUpdate, updated_by: int) -> User:
        user = self.repo.get(user_id)
        if not user or user.is_deleted:
            raise NotFoundException("User not found")
        if data.email and data.email != user.email:
            if self.repo.get_by_email(data.email):
                raise ConflictException("Email already in use")
        for field, value in data.model_dump(exclude_none=True).items():
            setattr(user, field, value)
        user.updated_by = updated_by
        self.db.commit()
        self.db.refresh(user)
        return user

    def toggle_status(self, user_id: int, status: UserStatus, updated_by: int) -> User:
        user = self.repo.get(user_id)
        if not user or user.is_deleted:
            raise NotFoundException("User not found")
        user.status = status
        user.updated_by = updated_by
        self.db.commit()
        self.db.refresh(user)
        return user

    def get_detail(self, user_id: int) -> User:
        user = self.repo.get(user_id)
        if not user or user.is_deleted:
            raise NotFoundException("User not found")
        return user

    def search(self, search: str = None, role: UserRole = None, status: UserStatus = None,
               page: int = 1, page_size: int = 20):
        return self.repo.search(search, role, status, page, page_size)

    def get_dropdown(self):
        return self.repo.get_all_active_employees()

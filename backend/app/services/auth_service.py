import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.core.security import (
    verify_password, get_password_hash, create_access_token,
    create_refresh_token, create_reset_token, decode_token,
)
from app.core.exceptions import CredentialsException, NotFoundException, ValidationException
from app.repositories.user_repository import UserRepository
from app.models.user import User, UserRole, UserStatus


class AuthService:
    def __init__(self, db: Session):
        self.repo = UserRepository(db)
        self.db = db

    def register(self, full_name: str, email: str, password: str) -> dict:
        if self.repo.get_by_email(email):
            raise ValidationException("An account with this email already exists")
        employee_code = "EMP" + uuid.uuid4().hex[:7].upper()
        while self.repo.get_by_employee_code(employee_code):
            employee_code = "EMP" + uuid.uuid4().hex[:7].upper()
        user = User(
            full_name=full_name,
            email=email,
            password_hash=get_password_hash(password),
            employee_code=employee_code,
            role=UserRole.EMPLOYEE,
            status=UserStatus.ACTIVE,
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        access = create_access_token(user.id, extra={"role": user.role.value, "email": user.email})
        refresh = create_refresh_token(user.id)
        return {"access_token": access, "refresh_token": refresh, "token_type": "bearer"}

    def login(self, email: str, password: str) -> dict:
        user = self.repo.get_by_email(email)
        if not user or not verify_password(password, user.password_hash):
            raise CredentialsException("Invalid email or password")
        if user.status == UserStatus.INACTIVE:
            raise CredentialsException("Account is deactivated. Contact your administrator.")
        user.last_login = datetime.now(timezone.utc)
        self.db.commit()
        access = create_access_token(user.id, extra={"role": user.role.value, "email": user.email})
        refresh = create_refresh_token(user.id)
        return {"access_token": access, "refresh_token": refresh, "token_type": "bearer"}

    def refresh(self, refresh_token: str) -> dict:
        payload = decode_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise CredentialsException("Invalid refresh token")
        user = self.repo.get(int(payload["sub"]))
        if not user or user.status == UserStatus.INACTIVE:
            raise CredentialsException("User not found or inactive")
        access = create_access_token(user.id, extra={"role": user.role.value, "email": user.email})
        new_refresh = create_refresh_token(user.id)
        return {"access_token": access, "refresh_token": new_refresh, "token_type": "bearer"}

    def forgot_password(self, email: str) -> str:
        user = self.repo.get_by_email(email)
        if not user:
            # Don't reveal whether email exists
            return "If the email exists, a reset link has been sent."
        token = create_reset_token(email)
        user.password_reset_token = token
        self.db.commit()
        return token

    def reset_password(self, token: str, new_password: str) -> None:
        payload = decode_token(token)
        if not payload or payload.get("type") != "reset":
            raise ValidationException("Invalid or expired reset token")
        user = self.repo.get_by_email(payload["sub"])
        if not user:
            raise NotFoundException("User not found")
        user.password_hash = get_password_hash(new_password)
        user.password_reset_token = None
        self.db.commit()

    def change_password(self, user_id: int, old_password: str, new_password: str) -> None:
        user = self.repo.get(user_id)
        if not user or not verify_password(old_password, user.password_hash):
            raise CredentialsException("Current password is incorrect")
        user.password_hash = get_password_hash(new_password)
        self.db.commit()

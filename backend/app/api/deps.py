from fastapi import Depends, Header
from sqlalchemy.orm import Session
from typing import Optional

from app.database.session import get_db
from app.core.security import decode_token
from app.core.exceptions import CredentialsException
from app.repositories.user_repository import UserRepository
from app.models.user import User, UserStatus


def _extract_token(authorization: Optional[str] = Header(None)) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise CredentialsException("Missing or malformed Authorization header")
    return authorization[7:]


def get_current_user(
    token: str = Depends(_extract_token),
    db: Session = Depends(get_db),
) -> User:
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise CredentialsException("Invalid or expired token")
    user_id = payload.get("sub")
    if not user_id:
        raise CredentialsException()
    user = UserRepository(db).get(int(user_id))
    if not user or user.is_deleted:
        raise CredentialsException("User not found")
    return user


def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    if current_user.status == UserStatus.INACTIVE:
        raise CredentialsException("Account is deactivated")
    return current_user

from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.api.deps import get_current_active_user
from app.schemas.auth import (
    LoginRequest, TokenResponse, RefreshRequest,
    ForgotPasswordRequest, ResetPasswordRequest, ChangePasswordRequest,
    RegisterRequest,
)
from app.schemas.user import UserResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    return AuthService(db).register(body.full_name, body.email, body.password)


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    return AuthService(db).login(body.email, body.password)


@router.post("/refresh", response_model=TokenResponse)
def refresh(body: RefreshRequest, db: Session = Depends(get_db)):
    return AuthService(db).refresh(body.refresh_token)


@router.post("/forgot-password")
def forgot_password(body: ForgotPasswordRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    svc = AuthService(db)
    token = svc.forgot_password(body.email)
    # email sending handled async in production
    return {"message": "If the email exists, a reset link has been sent."}


@router.post("/reset-password")
def reset_password(body: ResetPasswordRequest, db: Session = Depends(get_db)):
    AuthService(db).reset_password(body.token, body.new_password)
    return {"message": "Password reset successful"}


@router.post("/change-password")
def change_password(
    body: ChangePasswordRequest,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    AuthService(db).change_password(current_user.id, body.old_password, body.new_password)
    return {"message": "Password changed successfully"}


@router.get("/me", response_model=UserResponse)
def me(current_user=Depends(get_current_active_user)):
    return current_user

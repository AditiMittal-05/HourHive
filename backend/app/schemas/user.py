from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr
from app.models.user import UserRole, UserStatus


class UserBase(BaseModel):
    full_name: str
    email: EmailStr
    role: UserRole = UserRole.EMPLOYEE
    department: Optional[str] = None
    designation: Optional[str] = None
    phone: Optional[str] = None


class UserCreate(UserBase):
    employee_code: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    phone: Optional[str] = None
    status: Optional[UserStatus] = None


class UserResponse(UserBase):
    id: int
    employee_code: str
    status: UserStatus
    profile_pic: Optional[str] = None
    last_login: Optional[datetime] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class UserDropdown(BaseModel):
    id: int
    employee_code: str
    full_name: str

    model_config = {"from_attributes": True}

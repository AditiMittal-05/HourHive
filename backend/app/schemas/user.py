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
    department: Optional[str] = None
    designation: Optional[str] = None
    phone: Optional[str] = None
    status: Optional[UserStatus] = None


class UserManagerUpdate(BaseModel):
    manager_id: Optional[int] = None  # null to remove manager


class UserApproverToggle(BaseModel):
    can_approve_timesheets: bool


class UserResponse(UserBase):
    id: int
    employee_code: str
    status: UserStatus
    profile_pic: Optional[str] = None
    last_login: Optional[datetime] = None
    created_at: datetime
    manager_id: Optional[int] = None
    manager_name: Optional[str] = None
    can_approve_timesheets: bool = False

    model_config = {"from_attributes": True}


class UserDropdown(BaseModel):
    id: int
    employee_code: str
    full_name: str

    model_config = {"from_attributes": True}


class OrgNodeResponse(BaseModel):
    id: int
    employee_code: str
    full_name: str
    designation: Optional[str] = None
    department: Optional[str] = None
    status: UserStatus
    manager_id: Optional[int] = None
    manager_name: Optional[str] = None
    can_approve_timesheets: bool = False
    direct_report_count: int = 0

    model_config = {"from_attributes": True}

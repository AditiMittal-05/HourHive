from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.api.deps import get_current_active_user
from app.core.permissions import require_approver
from app.schemas.dashboard import EmployeeDashboard, ApproverDashboard
from app.services.dashboard_service import DashboardService
from app.models.user import UserRole

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/employee", response_model=EmployeeDashboard)
def employee_dashboard(
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    return DashboardService(db).get_employee_dashboard(current_user.id)


@router.get("/approver", response_model=ApproverDashboard)
def approver_dashboard(
    current_user=Depends(require_approver()),
    db: Session = Depends(get_db),
):
    approver_id = None if current_user.role == UserRole.SUPER_ADMIN else current_user.id
    return DashboardService(db).get_approver_dashboard(approver_id=approver_id)

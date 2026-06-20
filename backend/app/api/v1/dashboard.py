from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.api.deps import get_current_active_user
from app.core.permissions import require_admin
from app.schemas.dashboard import EmployeeDashboard, AdminDashboard
from app.services.dashboard_service import DashboardService
from app.models.user import UserRole

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/employee", response_model=EmployeeDashboard)
def employee_dashboard(
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    return DashboardService(db).get_employee_dashboard(current_user.id)


@router.get("/admin", response_model=AdminDashboard)
def admin_dashboard(
    current_user=Depends(require_admin()),
    db: Session = Depends(get_db),
):
    return DashboardService(db).get_admin_dashboard()

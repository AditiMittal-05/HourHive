"""Add super_admin role and seed SuperAdmin user

Revision ID: 002
Revises: 001
Create Date: 2024-06-20 00:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from datetime import datetime, timezone

revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()

    # 1. Extend the role ENUM to include super_admin (MySQL syntax)
    bind.execute(sa.text(
        "ALTER TABLE user_master MODIFY COLUMN role "
        "ENUM('employee', 'admin', 'super_admin') NOT NULL DEFAULT 'employee'"
    ))

    # 2. Seed the SuperAdmin account if none exists
    import sys, os
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
    from app.core.security import get_password_hash

    existing = bind.execute(
        sa.text("SELECT COUNT(*) FROM user_master WHERE role = 'super_admin'")
    ).scalar()

    if not existing:
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        hashed = get_password_hash("SuperAdmin@123456")
        bind.execute(sa.text("""
            INSERT INTO user_master
                (employee_code, full_name, email, password_hash, role, status,
                 created_at, updated_at, is_deleted)
            VALUES
                ('SA001', 'Super Admin', 'superadmin@hourhive.com', :hash,
                 'super_admin', 'active', :now, :now, 0)
        """), {"hash": hashed, "now": now})


def downgrade() -> None:
    bind = op.get_bind()

    # Remove super_admin users before reverting enum
    bind.execute(sa.text("DELETE FROM user_master WHERE role = 'super_admin'"))

    # Revert the ENUM to original values
    bind.execute(sa.text(
        "ALTER TABLE user_master MODIFY COLUMN role "
        "ENUM('employee', 'admin') NOT NULL DEFAULT 'employee'"
    ))

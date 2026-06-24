"""Refactor roles: remove admin, add manager_id + can_approve_timesheets

Revision ID: 004
Revises: 003
Create Date: 2026-06-24
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "004"
down_revision: Union[str, None] = "003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _column_exists(bind, table: str, column: str) -> bool:
    r = bind.execute(sa.text(
        "SELECT COUNT(*) FROM information_schema.columns "
        "WHERE table_schema = DATABASE() AND table_name = :t AND column_name = :c"
    ), {"t": table, "c": column})
    return bool(r.scalar())


def upgrade() -> None:
    bind = op.get_bind()

    # 1. Convert any existing admin users to employee (idempotent)
    bind.execute(sa.text("UPDATE user_master SET role = 'employee' WHERE role = 'admin'"))

    # 2. Add manager_id column + self-referential FK
    if not _column_exists(bind, "user_master", "manager_id"):
        op.add_column("user_master", sa.Column("manager_id", sa.Integer(), nullable=True))
        op.create_foreign_key(
            "fk_user_master_manager_id", "user_master", "user_master",
            ["manager_id"], ["id"],
        )

    # 3. Add can_approve_timesheets column
    if not _column_exists(bind, "user_master", "can_approve_timesheets"):
        op.add_column("user_master", sa.Column(
            "can_approve_timesheets", sa.Boolean(), nullable=False, server_default="0"
        ))

    # 4. Remove 'admin' from role ENUM if still present
    r = bind.execute(sa.text(
        "SELECT COLUMN_TYPE FROM information_schema.columns "
        "WHERE table_schema = DATABASE() AND table_name = 'user_master' AND column_name = 'role'"
    ))
    col_type = r.scalar() or ""
    # col_type is like: enum('super_admin','admin','employee')
    if "'admin'" in col_type and "'super_admin'" in col_type:
        bind.execute(sa.text(
            "ALTER TABLE user_master MODIFY COLUMN role "
            "ENUM('super_admin','employee') NOT NULL DEFAULT 'employee'"
        ))


def downgrade() -> None:
    bind = op.get_bind()

    # Restore admin enum value
    r = bind.execute(sa.text(
        "SELECT COLUMN_TYPE FROM information_schema.columns "
        "WHERE table_schema = DATABASE() AND table_name = 'user_master' AND column_name = 'role'"
    ))
    col_type = r.scalar() or ""
    if "'admin'" not in col_type:
        bind.execute(sa.text(
            "ALTER TABLE user_master MODIFY COLUMN role "
            "ENUM('super_admin','admin','employee') NOT NULL DEFAULT 'employee'"
        ))

    # Drop FK and columns if they exist
    try:
        op.drop_constraint("fk_user_master_manager_id", "user_master", type_="foreignkey")
    except Exception:
        pass
    if _column_exists(bind, "user_master", "can_approve_timesheets"):
        op.drop_column("user_master", "can_approve_timesheets")
    if _column_exists(bind, "user_master", "manager_id"):
        op.drop_column("user_master", "manager_id")

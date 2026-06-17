from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.database.session import get_db
from app.core.permissions import require_admin
from app.models.system_config import SystemConfig

router = APIRouter(prefix="/config", tags=["System Config"])


class ConfigUpdate(BaseModel):
    value: str
    description: Optional[str] = None


@router.get("")
def list_configs(_=Depends(require_admin()), db: Session = Depends(get_db)):
    return db.query(SystemConfig).all()


@router.put("/{key}")
def upsert_config(
    key: str,
    body: ConfigUpdate,
    current_user=Depends(require_admin()),
    db: Session = Depends(get_db),
):
    cfg = db.query(SystemConfig).filter(SystemConfig.config_key == key).first()
    if cfg:
        cfg.config_value = body.value
        if body.description:
            cfg.description = body.description
        cfg.updated_by = current_user.id
    else:
        cfg = SystemConfig(
            config_key=key,
            config_value=body.value,
            description=body.description,
            updated_by=current_user.id,
        )
        db.add(cfg)
    db.commit()
    return {"key": key, "value": body.value}

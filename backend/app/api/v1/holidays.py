import os
from datetime import date as DateType
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database.session import get_db
from app.api.deps import get_current_active_user
from app.core.permissions import require_super_admin
from app.core.exceptions import BusinessRuleException
from app.services.holiday_service import HolidayService

router = APIRouter(prefix="/holidays", tags=["Holidays"])

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", "uploads", "holidays")
os.makedirs(UPLOAD_DIR, exist_ok=True)


class HolidayResponse(BaseModel):
    id: int
    date: DateType
    name: str
    year: int

    model_config = {"from_attributes": True}


class HolidayListResponse(BaseModel):
    items: List[HolidayResponse]
    total: int
    pdf_url: Optional[str] = None


class HolidayCreate(BaseModel):
    date: DateType
    name: str


@router.get("", response_model=HolidayListResponse)
def list_holidays(
    year: int = Query(default=None),
    _=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    if year is None:
        from datetime import datetime
        year = datetime.now().year
    items = HolidayService(db).get_by_year(year)
    pdf_path = os.path.join(UPLOAD_DIR, f"{year}.pdf")
    pdf_url = f"/api/v1/holidays/pdf/{year}" if os.path.exists(pdf_path) else None
    return HolidayListResponse(
        items=[HolidayResponse.model_validate(h) for h in items],
        total=len(items),
        pdf_url=pdf_url,
    )


@router.post("", response_model=HolidayResponse, status_code=201)
def create_holiday(
    body: HolidayCreate,
    current_user=Depends(require_super_admin()),
    db: Session = Depends(get_db),
):
    try:
        holiday = HolidayService(db).create(body.date, body.name, current_user.id)
        return HolidayResponse.model_validate(holiday)
    except BusinessRuleException as e:
        raise HTTPException(status_code=409, detail=str(e))


@router.delete("/{holiday_id}", status_code=204)
def delete_holiday(
    holiday_id: int,
    current_user=Depends(require_super_admin()),
    db: Session = Depends(get_db),
):
    try:
        HolidayService(db).delete(holiday_id, current_user.id)
    except BusinessRuleException as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/upload-pdf/{year}", status_code=200)
async def upload_pdf(
    year: int,
    file: UploadFile = File(...),
    _=Depends(require_super_admin()),
):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")
    if file.size and file.size > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 10 MB)")
    dest = os.path.join(UPLOAD_DIR, f"{year}.pdf")
    content = await file.read()
    with open(dest, "wb") as f:
        f.write(content)
    return {"message": f"PDF for {year} uploaded successfully", "pdf_url": f"/api/v1/holidays/pdf/{year}"}


@router.get("/pdf/{year}")
def get_pdf(
    year: int,
    _=Depends(get_current_active_user),
):
    path = os.path.join(UPLOAD_DIR, f"{year}.pdf")
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail=f"No PDF uploaded for {year}")
    return FileResponse(path, media_type="application/pdf", filename=f"holidays_{year}.pdf")

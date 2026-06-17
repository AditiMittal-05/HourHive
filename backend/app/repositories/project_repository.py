from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.project import Project, ProjectStatus
from app.repositories.base_repository import BaseRepository


class ProjectRepository(BaseRepository[Project]):
    def __init__(self, db: Session):
        super().__init__(Project, db)

    def get_by_code(self, code: str) -> Optional[Project]:
        return self.db.query(Project).filter(Project.project_code == code, Project.is_deleted == False).first()

    def get_active(self) -> List[Project]:
        return self.db.query(Project).filter(
            Project.is_deleted == False, Project.status == ProjectStatus.ACTIVE
        ).order_by(Project.project_name).all()

    def search(self, search: str = None, status: ProjectStatus = None,
               page: int = 1, page_size: int = 20) -> Tuple[List[Project], int]:
        q = self.db.query(Project).filter(Project.is_deleted == False)
        if search:
            q = q.filter(or_(
                Project.project_name.ilike(f"%{search}%"),
                Project.project_code.ilike(f"%{search}%"),
                Project.customer_name.ilike(f"%{search}%"),
            ))
        if status:
            q = q.filter(Project.status == status)
        total = q.count()
        items = q.order_by(Project.project_name).offset((page - 1) * page_size).limit(page_size).all()
        return items, total

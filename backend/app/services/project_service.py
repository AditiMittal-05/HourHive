from sqlalchemy.orm import Session
from app.core.exceptions import ConflictException, NotFoundException
from app.repositories.project_repository import ProjectRepository
from app.models.project import Project, ProjectStatus
from app.schemas.project import ProjectCreate, ProjectUpdate


class ProjectService:
    def __init__(self, db: Session):
        self.repo = ProjectRepository(db)
        self.db = db

    def create(self, data: ProjectCreate, created_by: int) -> Project:
        if self.repo.get_by_code(data.project_code):
            raise ConflictException(f"Project code {data.project_code} already exists")
        project = Project(
            project_code=data.project_code,
            project_name=data.project_name,
            customer_name=data.customer_name,
            start_date=data.start_date,
            end_date=data.end_date,
            description=data.description,
            project_manager_id=data.project_manager_id,
            status=ProjectStatus.ACTIVE,
            created_by=created_by,
            updated_by=created_by,
        )
        return self.repo.save(project)

    def update(self, project_id: int, data: ProjectUpdate, updated_by: int) -> Project:
        project = self.repo.get(project_id)
        if not project or project.is_deleted:
            raise NotFoundException("Project not found")
        for field, value in data.model_dump(exclude_none=True).items():
            setattr(project, field, value)
        project.updated_by = updated_by
        self.db.commit()
        self.db.refresh(project)
        return project

    def toggle_status(self, project_id: int, status: ProjectStatus, updated_by: int) -> Project:
        project = self.repo.get(project_id)
        if not project or project.is_deleted:
            raise NotFoundException("Project not found")
        project.status = status
        project.updated_by = updated_by
        self.db.commit()
        self.db.refresh(project)
        return project

    def get_detail(self, project_id: int) -> Project:
        project = self.repo.get(project_id)
        if not project or project.is_deleted:
            raise NotFoundException("Project not found")
        return project

    def search(self, search: str = None, status: ProjectStatus = None, page: int = 1, page_size: int = 20):
        return self.repo.search(search, status, page, page_size)

    def get_active(self):
        return self.repo.get_active()

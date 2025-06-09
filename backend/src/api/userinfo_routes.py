from fastapi import APIRouter, Depends, status, Request
from fastapi.security import HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from src.config.db  import get_db
from src.services.userinfo import UserService
from src.models.schemas import UserUpdate
from src.middlewares.session_auth import get_current_user_id 

router = APIRouter(prefix="/api/my/update", tags=["users"])
security = HTTPBearer()

@router.patch("/", status_code=status.HTTP_200_OK)
async def update_current_user(
    request: Request,
    user_data: UserUpdate,
    db: AsyncSession = Depends(get_db)
):
    user_id = get_current_user_id(request)
    service = UserService(db)
    return await service.update_user(
        user_id=user_id,
        update_data=user_data.dict(exclude_unset=True)
    )
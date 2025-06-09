from fastapi import Request, HTTPException
from typing import Optional
from uuid import UUID
from fastapi import Depends, Request, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.config.db import get_db
from src.models.models import User

def get_current_user_id(request: Request):
    user_id = request.session.get("user_id")
    print(request.session)
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user_id

def require_admin(request: Request):
    if not request.session.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    return True


async def get_optional_user_id(request: Request) -> Optional[UUID]:
    return request.session.get("user_id")

async def get_current_user(
    request: Request,
    db: AsyncSession = Depends(get_db)
) -> User:
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    result = await db.execute(
        select(User).where(User.user_id == user_id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user
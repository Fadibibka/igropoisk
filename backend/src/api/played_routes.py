from fastapi import APIRouter, Depends, Request, HTTPException, status
from src.services.played import PlayedService
from sqlalchemy.ext.asyncio import AsyncSession
from src.config.db import get_db
from src.middlewares.session_auth import get_current_user_id 

router = APIRouter(prefix="/api/played", tags=["played"])

@router.post("/{game_id}")
async def add_to_played(
    game_id: int,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    user_id = get_current_user_id(request)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    return await PlayedService.add_to_played(db, user_id, game_id)

@router.delete("/{game_id}")
async def remove_from_played(
    game_id: int,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    user_id = get_current_user_id(request)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    return await PlayedService.remove_from_played(db, user_id, game_id)

@router.get("/")
async def get_played(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    user_id = get_current_user_id(request)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )

    return await PlayedService.get_user_played(db, user_id)
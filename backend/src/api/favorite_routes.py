from fastapi import APIRouter, Depends, Request, HTTPException, status
from src.services.favorites import FavoriteService
from sqlalchemy.ext.asyncio import AsyncSession
from src.config.db import get_db
from src.middlewares.session_auth import get_current_user_id 

router = APIRouter(prefix="/api/favorites", tags=["favorites"])

@router.post("/{game_id}")
async def add_to_favorites(
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
    
    return await FavoriteService.add_to_favorites(db, user_id, game_id)

@router.delete("/{game_id}")
async def remove_from_favorites(
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
    
    return await FavoriteService.remove_from_favorites(db, user_id, game_id)

@router.get("/")
async def get_favorites(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    user_id = get_current_user_id(request)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )

    return await FavoriteService.get_user_favorites(db, user_id)
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from src.models.models import UserFavorite, Game
from datetime import datetime

class FavoriteService:
    @staticmethod
    async def add_to_favorites(db: AsyncSession, user_id: str, game_id: int):
        result = await db.execute(select(Game).where(Game.game_id == game_id))
        game = result.scalars().first()
        if not game:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Game not found"
            )

        result = await db.execute(select(UserFavorite).where(
            UserFavorite.user_id == user_id,
            UserFavorite.game_id == game_id
        ))
        existing_favorite = result.scalars().first()
        
        if existing_favorite:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Game already in favorites"
            )

        new_favorite = UserFavorite(
            user_id=user_id,
            game_id=game_id,
            added_at=datetime.now()
        )
        db.add(new_favorite)
        await db.commit()
        
        return {"message": "Game added to favorites successfully"}

    @staticmethod
    async def remove_from_favorites(db: AsyncSession, user_id: str, game_id: int):
        result = await db.execute(select(UserFavorite).where(
            UserFavorite.user_id == user_id,
            UserFavorite.game_id == game_id
        ))
        favorite = result.scalars().first()
        
        if not favorite:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Favorite not found"
            )
        
        await db.delete(favorite)
        await db.commit()
        
        return {"message": "Game removed from favorites successfully"}

    @staticmethod
    async def get_user_favorites(db: AsyncSession, user_id: str):
        result = await db.execute(
            select(Game).join(UserFavorite).where(UserFavorite.user_id == user_id)
        )
        games = result.scalars().all()
        return games

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from src.models.models import UserPlayed, Game
from datetime import datetime

class PlayedService:
    @staticmethod
    async def add_to_played(db: AsyncSession, user_id: str, game_id: int):
        result = await db.execute(select(Game).where(Game.game_id == game_id))
        game = result.scalars().first()
        if not game:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Game not found"
            )

        result = await db.execute(select(UserPlayed).where(
            UserPlayed.user_id == user_id,
            UserPlayed.game_id == game_id
        ))
        existing_played = result.scalars().first()
        
        if existing_played:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Game already in played"
            )

        new_played = UserPlayed(
            user_id=user_id,
            game_id=game_id,
            added_at=datetime.now()
        )
        db.add(new_played)
        await db.commit()
        
        return {"message": "Game added to played successfully"}

    @staticmethod
    async def remove_from_played(db: AsyncSession, user_id: str, game_id: int):
        result = await db.execute(select(UserPlayed).where(
            UserPlayed.user_id == user_id,
            UserPlayed.game_id == game_id
        ))
        played = result.scalars().first()
        
        if not played:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="played not found"
            )
        
        await db.delete(played)
        await db.commit()
        
        return {"message": "Game removed from played successfully"}

    @staticmethod
    async def get_user_played(db: AsyncSession, user_id: str):
        result = await db.execute(
            select(Game).join(UserPlayed).where(UserPlayed.user_id == user_id)
        )
        games = result.scalars().all()
        return games

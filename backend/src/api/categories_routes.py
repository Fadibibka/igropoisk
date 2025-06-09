from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from src.models.models import Genre
from src.config.db import get_db
from src.services.categories import get_genres_with_logos,get_top_games_by_genre, get_other_games_by_genre, get_related_genres_by_genre_id
from src.models.schemas import GenreOut, GenreWithLogos
from src.models.schemas import GameOut, TopGamesByGenreOut, RelatedGenreOut  

router = APIRouter(
    prefix="/api/genres",
    tags=["Genres"]
)

@router.get("/with-logos", response_model=List[GenreWithLogos])
async def fetch_genres_with_logos(db: AsyncSession = Depends(get_db)):
    return await get_genres_with_logos(db)

@router.get("/{genre_id}/top-games", response_model=TopGamesByGenreOut)
async def top_games(genre_id: int, db: AsyncSession = Depends(get_db)):
    games, genre_name = await get_top_games_by_genre(genre_id, db)
    return {"genre_name": genre_name, "games": games}

@router.get("/", response_model=List[GenreOut])
async def get_all_genres(db: AsyncSession = Depends(get_db)):
    stmt = select(Genre)
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/{genre_id}/other-games", response_model=TopGamesByGenreOut)
async def other_games(genre_id: int, db: AsyncSession = Depends(get_db)):
    games, genre_name = await get_other_games_by_genre(genre_id, db)
    return {"genre_name": genre_name, "games": games}

@router.get("/{genre_id}/related-genres", response_model=List[RelatedGenreOut])
async def related_genres(genre_id: int, db: AsyncSession = Depends(get_db)):
    return await get_related_genres_by_genre_id(genre_id, db)

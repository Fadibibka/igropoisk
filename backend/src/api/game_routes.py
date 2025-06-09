from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from src.models.models import Game
from src.services.games import get_all_games
from src.services.games import get_hero_games
from src.services.games import get_popular_games
from src.services.games import get_game_by_id
from src.models.schemas import DevelopersOut, GameOut
from src.config.db import get_db

router = APIRouter(
    prefix="/api/games",
    tags=["Games"]
)


@router.get("/", response_model=List[GameOut])
async def fetch_games(
    genre_ids: Optional[str] = None,
    min_rating: Optional[float] = None,
    age_rating: Optional[str] = None,
    from_year: Optional[int] = None,
    to_year: Optional[int] = None,
    platform_ids: Optional[str] = None,
    developers: Optional[str] = None,
    sort_by: str = "popular-desc",  # Добавляем параметр сортировки
    db: AsyncSession = Depends(get_db)
):
    genre_id_list = [int(gid) for gid in genre_ids.split(",")] if genre_ids else None
    platform_id_list = [int(pid) for pid in platform_ids.split(",")] if platform_ids else None
    developers_list = [str(dev) for dev in developers.split(",")] if developers else None

    return await get_all_games(
        db,
        genre_id_list,
        min_rating,
        age_rating,
        from_year,
        to_year,
        platform_id_list,
        developers_list,
        sort_by  # Передаем параметр сортировки
    )

@router.get("/hero", response_model=list[GameOut])
async def read_hero_games(db: AsyncSession = Depends(get_db)):
    return await get_hero_games(db)

@router.get("/studios", response_model=List[DevelopersOut])
async def get_all_developers(db: AsyncSession = Depends(get_db)):
    stmt = select(Game.developer).distinct()  # выбираем уникальные разработчики
    result = await db.execute(stmt)
    developers = result.scalars().all()
    # Возвращаем список словарей, чтобы соответствовать модели DevelopersOut
    return [{"developer": dev} for dev in developers]

@router.get("/popular", response_model=List[GameOut])
async def fetch_popular_games(db: AsyncSession = Depends(get_db)):
    return await get_popular_games(db)

@router.get("/{game_id}", response_model=GameOut)
async def fetch_game_by_id(
    game_id: int,
    db: AsyncSession = Depends(get_db)
):
    return await get_game_by_id(game_id, db)

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from sqlalchemy.orm import selectinload, with_loader_criteria
from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timedelta
from typing import List, Optional

from src.models.models import Game, GameMaterial, GamePlatform, Genre, UserRating

HERO_GAME_IDS = [29, 34, 36, 38, 28]
POPULAR_GAME_IDS = [1, 4, 11, 9]

async def search_games(query: str, db: AsyncSession) -> List[Game]:
    stmt = (
        select(Game)
        .where(Game.title.ilike(f"%{query}%"))  # регистронезависимый поиск
        .options(
            selectinload(Game.materials),
            selectinload(Game.genres)
        )
        .order_by(Game.release_date.desc())
        .limit(20)
    )
    result = await db.execute(stmt)
    return result.scalars().unique().all()

async def get_hero_games(db: AsyncSession):
    result = await db.execute(
        select(Game)
        .options(
            selectinload(Game.materials),
            selectinload(Game.genres)
        )
        .where(Game.game_id.in_(HERO_GAME_IDS))
    )
    return result.scalars().unique().all()

async def get_all_games(
    db: AsyncSession,
    genre_ids: Optional[List[int]] = None,
    min_rating: Optional[float] = None,
    age_rating: Optional[str] = None,
    from_year: Optional[int] = None,
    to_year: Optional[int] = None,
    platform_ids: Optional[List[int]] = None,
    developers: Optional[List[str]] = None,  # Добавляем параметр для фильтрации по студиям
    sort_by: str = "popular-desc"
) -> List[Game]:
    recent_days = 30
    recent_threshold = datetime.utcnow() - timedelta(days=recent_days)

    recent_reviews_subq = (
        select(
            UserRating.game_id,
            func.count(UserRating.rating_id).label("recent_review_count")
        )
        .where(UserRating.created_at >= recent_threshold)
        .group_by(UserRating.game_id)
        .subquery()
    )

    stmt = select(Game).outerjoin(
        recent_reviews_subq, 
        Game.game_id == recent_reviews_subq.c.game_id
    ).options(
        selectinload(Game.materials),
        with_loader_criteria(GameMaterial, GameMaterial.material_type == "vertical_logo", include_aliases=True),
        selectinload(Game.genres)
    )

    # Добавляем сортировку
    order_clauses = []
    if sort_by == "popular-desc":
        order_clauses.append(recent_reviews_subq.c.recent_review_count.desc().nulls_last())
    elif sort_by == "popular-asc":
        order_clauses.append(recent_reviews_subq.c.recent_review_count.asc().nulls_last())
    elif sort_by == "date-asc":
        order_clauses.append(Game.release_date.asc())
    elif sort_by == "date-desc":
        order_clauses.append(Game.release_date.desc())
    elif sort_by == "rating-asc":
        order_clauses.append(Game.average_user_rating.asc().nulls_last())
    elif sort_by == "rating-desc":
        order_clauses.append(Game.average_user_rating.desc().nulls_last())
    elif sort_by == "critics-asc":
        order_clauses.append(Game.average_critic_rating.asc().nulls_last())
    elif sort_by == "critics-desc":
        order_clauses.append(Game.average_critic_rating.desc().nulls_last())
    
    # Добавляем сортировку по дате как вторичный критерий
    if sort_by not in ["date-asc", "date-desc"]:
        order_clauses.append(Game.release_date.desc())

    stmt = stmt.order_by(*order_clauses)

    # Применяем фильтры
    if genre_ids:
        stmt = stmt.join(Game.genres).where(Genre.genre_id.in_(genre_ids))

    if min_rating is not None:
        stmt = stmt.where(Game.average_user_rating >= min_rating)

    if age_rating and age_rating != "Любой":
        stmt = stmt.where(Game.age_rating == age_rating)

    if from_year is not None:
        stmt = stmt.where(func.extract('year', Game.release_date) >= from_year)
    
    if to_year is not None:
        stmt = stmt.where(func.extract('year', Game.release_date) <= to_year)

    if platform_ids:
        stmt = stmt.join(GamePlatform).where(GamePlatform.platform_id.in_(platform_ids))

    if developers:  # Добавляем фильтрацию по студиям
        stmt = stmt.where(Game.developer.in_(developers))

    result = await db.execute(stmt)
    games = result.scalars().unique().all()

    for game in games:
        game.genres = [game.genres[0]] if game.genres else []

    return games


async def get_game_by_id(game_id: int, db: AsyncSession):
    result = await db.execute(
        select(Game)
        .where(Game.game_id == game_id)
        .options(
            selectinload(Game.materials),
            selectinload(Game.genres)
        )
    )
    game = result.scalars().first()

    if not game:
        raise HTTPException(status_code=404, detail="Игра не найдена")

    return game

async def get_popular_games(db: AsyncSession) -> List[Game]:
    recent_days = 30
    recent_threshold = datetime.utcnow() - timedelta(days=recent_days)

    recent_reviews_subq = (
        select(
            UserRating.game_id,
            func.count(UserRating.rating_id).label("recent_review_count")
        )
        .where(UserRating.created_at >= recent_threshold)
        .group_by(UserRating.game_id)
        .subquery()
    )

    stmt = (
        select(Game)
        .outerjoin(recent_reviews_subq, Game.game_id == recent_reviews_subq.c.game_id)
        .order_by(
            recent_reviews_subq.c.recent_review_count.desc().nulls_last(),
            Game.release_date.desc()
        )
        .limit(4)
        .options(
            selectinload(Game.materials),
            with_loader_criteria(GameMaterial, GameMaterial.material_type == "vertical_logo", include_aliases=True),
            selectinload(Game.genres)
        )
    )

    result = await db.execute(stmt)
    games = result.scalars().unique().all()

    for game in games:
        game.genres = [game.genres[0]] if game.genres else []

    return games
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select,literal_column
from sqlalchemy import func, desc
from sqlalchemy.orm import selectinload
from typing import List
from datetime import datetime, timedelta
from typing import Tuple

from src.models.models import Genre, GameGenre, GameMaterial, Game, UserRating
from src.models.schemas import GenreWithLogos

async def get_genres_with_logos(db: AsyncSession) -> List[GenreWithLogos]:
    genres_result = await db.execute(select(Genre))
    genres = genres_result.scalars().all()

    response = []

    for genre in genres:
        # Получаем ID игр с этим жанром
        game_ids_result = await db.execute(
            select(GameGenre.game_id).where(GameGenre.genre_id == genre.genre_id)
        )
        game_ids = [row[0] for row in game_ids_result.fetchall()]

        if not game_ids:
            response.append(GenreWithLogos(genre_id=genre.genre_id, genre_name=genre.name, logos=[]))
            continue

        # Получаем 3 логотипа
        logos_result = await db.execute(
            select(GameMaterial.material_url)
            .where(
                GameMaterial.game_id.in_(game_ids),
                GameMaterial.material_type == "horizontal_logo"
            )
            .limit(3)
        )
        logos = [row[0] for row in logos_result.fetchall()]

        response.append(GenreWithLogos(genre_id=genre.genre_id, genre_name=genre.name, logos=logos))

    return response


async def get_related_genres_by_genre_id(genre_id: int, db: AsyncSession, limit: int = 6) -> List[Tuple[int, str, int]]:
    # Получаем имя исходного жанра
    base_genre_stmt = (
        select(Genre.genre_id, Genre.name, literal_column("0").label("overlap_count"))
        .where(Genre.genre_id == genre_id)
    )

    # Ищем игры с этим жанром
    games_with_genre_subq = (
        select(Game.game_id)
        .join(Game.genres)
        .filter(Genre.genre_id == genre_id)
        .subquery()
    )

    # Получаем сопутствующие жанры и их пересечения
    related_genres_stmt = (
        select(
            Genre.genre_id,
            Genre.name,
            func.count().label("overlap_count")
        )
        .select_from(Game)
        .join(Game.genres)
        .filter(Game.game_id.in_(select(games_with_genre_subq)))
        .filter(Genre.genre_id != genre_id)
        .group_by(Genre.genre_id, Genre.name)
        .order_by(func.count().desc())
        .limit(limit)
    )

    # Объединяем основной жанр и связанные
    union_stmt = base_genre_stmt.union_all(related_genres_stmt)

    result = await db.execute(union_stmt)
    return result.all()

async def get_top_games_by_genre(genre_id: int, db: AsyncSession) -> Tuple[List[Game], str]:
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
        select(Game, Genre.name)
        .join(Game.genres)
        .outerjoin(recent_reviews_subq, Game.game_id == recent_reviews_subq.c.game_id)
        .filter(Genre.genre_id == genre_id)
        .order_by(
            recent_reviews_subq.c.recent_review_count.desc().nulls_last(),
            Game.release_date.desc()
        )
        .limit(5)
        .options(selectinload(Game.genres), selectinload(Game.materials))
    )

    result = await db.execute(stmt)
    games_with_genre = result.all()

    if not games_with_genre:
        return [], ""

    games, genre_name = zip(*games_with_genre)
    return list(set(games)), genre_name[0]



async def get_other_games_by_genre(genre_id: int, db: AsyncSession) -> List[Game]:
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
        select(Game, Genre.name)
        .join(Game.genres)
        .outerjoin(recent_reviews_subq, Game.game_id == recent_reviews_subq.c.game_id)
        .filter(Genre.genre_id == genre_id)
        .order_by(
            recent_reviews_subq.c.recent_review_count.desc().nulls_last(),
            Game.release_date.desc()
        )
        .options(selectinload(Game.genres), selectinload(Game.materials))
    )

    result = await db.execute(stmt)
    games_with_genre = result.all()

    if not games_with_genre:
        return [], ""

    games, genre_name = zip(*games_with_genre)
    return list(set(games)), genre_name[0]
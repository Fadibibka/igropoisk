from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from src.models.models import UserRating, Game, Genre, GameGenre
from collections import defaultdict
from typing import Dict, List, Tuple
import uuid

async def get_top_developers(user_id: uuid.UUID, db: AsyncSession, limit: int = 3) -> List[Tuple[str, float]]:
    """
    Возвращает список топ-N разработчиков, отсортированных по средней оценке пользователя.
    Формат: [(developer_name, avg_rating), ...]
    """
    stmt = (
        select(Game.developer, func.avg(UserRating.rating).label("avg_rating"))
        .join(UserRating, UserRating.game_id == Game.game_id)
        .where(UserRating.user_id == user_id)
        .group_by(Game.developer)
        .having(func.count(UserRating.rating_id) >= 1)
        .order_by(func.avg(UserRating.rating).desc())
        .limit(limit)
    )

    result = await db.execute(stmt)
    top_developers = result.all()

    return top_developers

async def get_user_genre_ratings(user_id: uuid.UUID, db: AsyncSession) -> Dict[int, List[float]]:
    """
    Возвращает словарь жанр_id → список оценок пользователя по играм этого жанра.
    """
    stmt = (
        select(Genre.genre_id, UserRating.rating)
        .join(GameGenre, GameGenre.genre_id == Genre.genre_id)
        .join(Game, Game.game_id == GameGenre.game_id)
        .join(UserRating, UserRating.game_id == Game.game_id)
        .where(UserRating.user_id == user_id)
    )
    result = await db.execute(stmt)
    genre_ratings: Dict[int, List[float]] = defaultdict(list)
    for genre_id, rating in result:
        genre_ratings[genre_id].append(float(rating))
    return genre_ratings


async def get_top_genres(user_id: uuid.UUID, db: AsyncSession, top_n: int = 3) -> List[Tuple[int, float]]:
    """
    Вычисляет топ-N любимых жанров пользователя по среднему рейтингу.
    Возвращает список кортежей: (genre_id, avg_rating).
    """
    genre_ratings = await get_user_genre_ratings(user_id, db)
    avg_by_genre = [
        (genre_id, sum(ratings) / len(ratings))
        for genre_id, ratings in genre_ratings.items()
        if len(ratings) >= 2  # фильтр по достаточному числу оценок
    ]
    sorted_genres = sorted(avg_by_genre, key=lambda x: x[1], reverse=True)

    return sorted_genres[:top_n]


async def build_genre_vector(user_id: uuid.UUID, db: AsyncSession) -> Dict[int, float]:
    """
    Возвращает TF-IDF-подобный вектор жанров: genre_id → вес.
    Вес = частота жанра среди оцененных игр, нормированная.
    """
    stmt = (
        select(Genre.genre_id)
        .join(GameGenre, GameGenre.genre_id == Genre.genre_id)
        .join(Game, Game.game_id == GameGenre.game_id)
        .join(UserRating, UserRating.game_id == Game.game_id)
        .where(UserRating.user_id == user_id)
    )
    result = await db.execute(stmt)
    genre_counts = defaultdict(int)
    total = 0
    for genre_id, in result:
        genre_counts[genre_id] += 1
        total += 1

    if total == 0:
        return {}

    genre_vector = {genre_id: count / total for genre_id, count in genre_counts.items()}
    return genre_vector

async def get_user_rare_genres(user_id: uuid.UUID, db: AsyncSession, bottom_n: int = 5) -> List[int]:
    """
    Возвращает список genre_id, представляющих собой редкие жанры — те, что пользователь оценивал реже всего.
    """
    stmt = (
        select(Genre.genre_id)
        .join(GameGenre, GameGenre.genre_id == Genre.genre_id)
        .join(Game, Game.game_id == GameGenre.game_id)
        .join(UserRating, UserRating.game_id == Game.game_id)
        .where(UserRating.user_id == user_id)
    )
    result = await db.execute(stmt)

    genre_counts: Dict[int, int] = defaultdict(int)
    for genre_id, in result:
        genre_counts[genre_id] += 1

    sorted_genres = sorted(genre_counts.items(), key=lambda x: x[1])
    rare_genres = [genre_id for genre_id, _ in sorted_genres[:bottom_n]]

    return rare_genres
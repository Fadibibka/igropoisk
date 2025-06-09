from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List
import uuid


from src.models.models import Game
from src.services.recommendation_engine.data_prep.genre_analysis import build_genre_vector, get_top_developers

def jaccard_index(set1: set, set2: set) -> float:
    """Коэффициент Жаккара между двумя множествами"""
    if not set1 or not set2:
        return 0.0
    return len(set1 & set2) / len(set1 | set2)


async def get_all_games_with_meta(db: AsyncSession) -> List[Game]:
    """Загружает все игры с жанрами"""
    stmt = (
        select(Game)
        .options(
            selectinload(Game.genres)
        )
    )
    result = await db.execute(stmt)
    return result.scalars().unique().all()


async def generate_cb_recommendations(user_id: uuid.UUID, db: AsyncSession, limit: int = 20) -> List[Game]:
    """
    Контентная фильтрация:
    - по жанрам (TF)
    - по топ разработчикам
    """
    # Вектор интересов по жанрам
    genre_vector = await build_genre_vector(user_id, db)
    if not genre_vector:
        return []

    user_genres = set(genre_vector.keys())

    # Топ разработчики
    top_devs = await get_top_developers(user_id, db)
    print(top_devs)
    top_dev_names = {dev for dev, _ in top_devs}
    print(top_dev_names)

    # Все игры
    all_games = await get_all_games_with_meta(db)

    # Фильтрация по контенту
    cb_candidates = []
    for game in all_games:
        if not game.genres or not game.developer:
            continue

        similarity = compute_cb_similarity(game, user_genres, top_dev_names)
        if similarity >= 0.5:
            cb_candidates.append((game, similarity))

    return cb_candidates[:limit], user_genres, top_dev_names

def compute_cb_similarity(game: Game, user_genre_ids: set, top_dev_names: set) -> float:
    game_genre_ids = {genre.genre_id for genre in game.genres}
    genre_sim = jaccard_index(user_genre_ids, game_genre_ids)
    dev_bonus = 0.1 if game.developer in top_dev_names else 0.0

    return min(genre_sim + dev_bonus, 1.0)
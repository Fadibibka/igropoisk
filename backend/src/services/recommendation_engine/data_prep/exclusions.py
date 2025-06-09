from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from src.models.models import Game, UserGenreExclusion, UserPlatformExclusion, UserPlayed, UserRating  # предположим, что Game связан с genres и platforms
from typing import List
import uuid


async def get_user_exclusions(user_id: uuid.UUID, db: AsyncSession):
    genre_ids = (
        await db.execute(
            select(UserGenreExclusion.genre_id).where(UserGenreExclusion.user_id == user_id)
        )
    ).scalars().all()

    platform_ids = (
        await db.execute(
            select(UserPlatformExclusion.platform_id).where(UserPlatformExclusion.user_id == user_id)
        )
    ).scalars().all()

    return set(genre_ids), set(platform_ids)

def filter_games_by_exclusions(
    games: List[Game],
    excluded_genres: set[int],
    excluded_platforms: set[int]
) -> List[Game]:
    filtered = []
    for game in games:
        genre_ids = {genre.genre_id for genre in game.genres}
        platform_ids = {platform.platform_id for platform in getattr(game, "platforms", [])}

        if genre_ids.isdisjoint(excluded_genres) and platform_ids.isdisjoint(excluded_platforms):
            filtered.append(game)
    return filtered

async def get_user_interacted_game_ids(user_id: uuid.UUID, db: AsyncSession) -> set[uuid.UUID]:
    """
    Возвращает множество game_id, с которыми пользователь уже взаимодействовал (оценил или играл).
    """
    rated_ids = (
        await db.execute(
            select(UserRating.game_id).where(UserRating.user_id == user_id)
        )
    ).scalars().all()

    played_ids = (
        await db.execute(
            select(UserPlayed.game_id).where(UserPlayed.user_id == user_id)
        )
    ).scalars().all()

    return set(rated_ids) | set(played_ids)
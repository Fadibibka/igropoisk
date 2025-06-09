from typing import List, Dict, Tuple
from src.models.models import Game, UserRating
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
import datetime

# Настройки весов
WEIGHTS = {
    "genre_match": 0.35,
    "cf_score": 0.25,
    "popularity": 0.15,
    "novelty": 0.10,
    "dev_UserRating": 0.15,
}

RARE_GENRE_BONUS = 1.2  # +20%
NEW_GAME_YEARS = 1       # до 1 года — считается новой

async def get_game_popularity(db: AsyncSession) -> Dict[int, float]:
    """
    Возвращает словарь {game_id: popularity_score} (нормализованное число оценок)
    """
    result = await db.execute(
        select(UserRating.game_id, func.count().label("cnt")).group_by(UserRating.game_id)
    )
    counts = result.all()

    if not counts:
        return {}

    max_count = max(c for _, c in counts) or 1
    return {gid: round(cnt / max_count, 4) for gid, cnt in counts}


async def get_developer_avg_UserRatings(db: AsyncSession) -> Dict[str, float]:
    stmt = select(
        Game.developer,
        func.avg(Game.average_user_rating).label('avg_rating')
    ).group_by(Game.developer)

    result = await db.execute(stmt)
    data = result.all()

    # Преобразуем Decimal в float перед округлением
    return {dev: round(float(avg), 4) for dev, avg in data if dev}

def compute_age_bonus(release_date: datetime.date) -> float:
    if not release_date:
        return 1.0
    today = datetime.date.today()
    age_days = (today - release_date).days
    if age_days < 365:
        return 1.1  # новизна — +10%
    return 1.0


def apply_diversity_bonus(game: Game, rare_genre_ids: set) -> float:
    if not game.genres:
        return 1.0
    game_genre_ids = {g.genre_id for g in game.genres}
    if game_genre_ids & rare_genre_ids:
        return RARE_GENRE_BONUS
    return 1.0


async def rank_games(
    user_id,
    db: AsyncSession,
    hybrid_results: List[Tuple[Game, Dict]],
    rare_genre_ids: set = set(),
    top_k: int = 10,
) -> List[Tuple[Game, float]]:
    """
    Ранжирует игры по комплексной весовой модели.
    """

    # Загрузка метаданных
    popularity_scores = await get_game_popularity(db)
    developer_scores = await get_developer_avg_UserRatings(db)

    ranked: List[Tuple[Game, float]] = []

    for game, explanation in hybrid_results:
        score = 0.0

        # 1. Контентное совпадение (CB)
        genre_score = explanation.get("components", {}).get("CB", 0.0)

        # 2. CF
        cf_score = explanation.get("components", {}).get("CF", 0.0)

        # 3. Популярность
        popularity = popularity_scores.get(game.game_id, 0.0)

        # 4. Новизна
        novelty = compute_age_bonus(game.release_date)

        # 5. Оценки разработчика
        dev_score = developer_scores.get(game.developer, 0.0) if game.developer else 0.0

        # Промежуточный подсчет
        base_score = (
            genre_score * WEIGHTS["genre_match"] +
            cf_score * WEIGHTS["cf_score"] +
            popularity * WEIGHTS["popularity"] +
            novelty * WEIGHTS["novelty"] +
            dev_score * WEIGHTS["dev_UserRating"]
        )

        # --- Модификаторы ---
        diversity_bonus = apply_diversity_bonus(game, rare_genre_ids)
        final_score = round(base_score * diversity_bonus, 4)

        ranked.append((game, final_score))


    ranked.sort(key=lambda x: x[1], reverse=True)
    return ranked[:top_k]

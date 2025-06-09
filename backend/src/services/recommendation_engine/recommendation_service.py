from src.services.recommendation_engine.algorithms.hybrid import generate_hybrid_recommendations
from src.services.recommendation_engine.algorithms.ranking import rank_games
from src.services.recommendation_engine.data_prep.genre_analysis import get_user_rare_genres
from src.models.models import Game
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any
import uuid


async def get_hybrid_recommendations(user_id: uuid.UUID, db: AsyncSession) -> Dict[str, List[Dict[str, Any]]]:
    # Гибридная генерация
    hybrid_results = await generate_hybrid_recommendations(user_id, db)

    # Вычисление редких жанров пользователя
    rare_genres = set(await get_user_rare_genres(user_id, db))

    # Ранжирование игр
    ranked = await rank_games(user_id, db, hybrid_results, rare_genre_ids=rare_genres, top_k=20)
    print(ranked)
    result = {
        "main": [],
        "additional": [],
        "reserve": []
    }

    for i, (game, score) in enumerate(ranked):
        explanation = next((e for g, e in hybrid_results if g.game_id == game.game_id), {})
        entry = {
            "game_id": game.game_id,
            "title": game.title,
            "developer": game.developer,
            "genres": [genre.name for genre in game.genres],
            "match_score": round(score, 4),
            "reason": explanation.get("reason", "Гибридная рекомендация"),
            "explanation": explanation,
        }

        if i < 4:
            result["main"].append(entry)
        elif i < 10:
            result["additional"].append(entry)
        else:
            result["reserve"].append(entry)

    return result
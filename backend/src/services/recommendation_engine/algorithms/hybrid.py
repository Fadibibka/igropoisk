from sqlalchemy.ext.asyncio import AsyncSession
from src.models.models import Game
from src.services.recommendation_engine.algorithms.surprise import train_surprise_model, recommend_games_cf
from src.services.recommendation_engine.algorithms.CB import generate_cb_recommendations
from src.services.recommendation_engine.data_prep.exclusions import get_user_exclusions, filter_games_by_exclusions, get_user_interacted_game_ids
from src.services.recommendation_engine.explainer.explainer import explain_game_recommendation
from sqlalchemy import select
from typing import List, Dict, Tuple
import uuid
import datetime
from sqlalchemy.orm import joinedload

def score_with_prioritization(base_score: float, game: Game) -> float:
    today = datetime.date.today()
    score = base_score

    if game.release_date and (today - game.release_date).days < 365:
        score *= 1.15

    return round(score, 4)


async def generate_hybrid_recommendations(
    user_id: uuid.UUID, db: AsyncSession, top_n: int = 20
) -> List[Tuple[Game, Dict]]:
    """
    Гибридная рекомендация с объяснениями.
    Возвращает список кортежей (игра, объяснение).
    """

    # --- 1. Collaborative Filtering ---
    model = await train_surprise_model(db)

    rated_game_ids = (
        await db.execute(
            select(Game.game_id).join_from(Game, Game.ratings).where(Game.ratings.any(user_id=user_id))
        )
    ).scalars().all()

    all_games = (
        await db.execute(select(Game).options(joinedload(Game.materials), joinedload(Game.genres)))
    ).scalars().unique().all()

    all_game_ids = [game.game_id for game in all_games]
    id_to_game = {game.game_id: game for game in all_games}

    cf_predictions = await recommend_games_cf(user_id, db, model, all_game_ids, rated_game_ids)
    cf_weighted: Dict[int, float] = {
        gid: score_with_prioritization((pred / 5.0) * 0.6, id_to_game[gid])
        for gid, pred in cf_predictions if gid in id_to_game
    }

    # --- 2. Content-Based Filtering ---
    cb_games, user_genres, top_dev_names = await generate_cb_recommendations(user_id, db)
        # верни как dict
    cb_weighted = {
        game.game_id: (score_with_prioritization(sim * 0.4, game), game.developer in top_dev_names)
        for game, sim in cb_games
    }
    cb_game_ids = set(cb_weighted.keys())

    # --- 3. Гибридизация ---
    hybrid_scores: Dict[int, float] = {}

    for gid, (score, _) in cb_weighted.items():
        hybrid_scores[gid] = hybrid_scores.get(gid, 0.0) + score

    for gid, score in cf_weighted.items():
        hybrid_scores[gid] = hybrid_scores.get(gid, 0.0) + score

    sorted_game_ids = sorted(hybrid_scores.items(), key=lambda x: x[1], reverse=True)
    interacted_ids = await get_user_interacted_game_ids(user_id, db)
    recommended_games = [id_to_game[gid] for gid, _ in sorted(hybrid_scores.items(), key=lambda x: x[1], reverse=True)
                     if gid in id_to_game and gid not in interacted_ids]
    # --- 4. Исключения ---
    excluded_genres, excluded_platforms = await get_user_exclusions(user_id, db)
    filtered_games = filter_games_by_exclusions(recommended_games, excluded_genres, excluded_platforms)

    # --- 5. Объяснения ---
    today = datetime.date.today()
    result: List[Tuple[Game, Dict]] = []

    for game in filtered_games[:top_n]:
        gid = game.game_id
        cb_data = cb_weighted.get(gid)
        cb_score = cb_data[0] if cb_data else None
        dev_matched = cb_data[1] if cb_data else False

        explanation = explain_game_recommendation(
            game=game,
            cf_score=cf_weighted.get(gid),
            cb_score=cb_score,
            final_score=hybrid_scores.get(gid),
            matched_genres=[genre.name for genre in game.genres] if gid in cb_game_ids else None,
            matched_developer=game.developer if dev_matched else None
        )
        result.append((game, explanation))
    

    return result

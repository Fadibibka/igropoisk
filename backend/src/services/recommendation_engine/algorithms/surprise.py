import pandas as pd
from surprise import Dataset, Reader, SVD
from surprise.model_selection import train_test_split
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from src.models.models import UserRating
import uuid
from typing import List, Tuple

reader = Reader(rating_scale=(0, 5))

async def fetch_ratings(db: AsyncSession) -> pd.DataFrame:
    result = await db.execute(
        select(UserRating.user_id, UserRating.game_id, UserRating.rating)
    )
    rows = result.all()
    return pd.DataFrame(rows, columns=["user_id", "game_id", "rating"])


async def train_surprise_model(db: AsyncSession) -> SVD:
    df = await fetch_ratings(db)
    if df.empty:
        raise ValueError("Нет рейтингов для обучения")
    
    data = Dataset.load_from_df(df[["user_id", "game_id", "rating"]], reader)
    trainset = data.build_full_trainset()

    model = SVD()
    model.fit(trainset)
    return model


async def recommend_games_cf(
    user_id: uuid.UUID,
    db: AsyncSession,
    model: SVD,
    all_game_ids: List[int],
    known_game_ids: List[int],
    top_k: int = 20
) -> List[Tuple[int, float]]:
    """
    Возвращает список кортежей (game_id, predicted_rating) по CF
    """
    predictions = []
    for game_id in all_game_ids:
        if game_id in known_game_ids:
            continue
        pred = model.predict(str(user_id), str(game_id))
        predictions.append((int(game_id), pred.est))

    predictions.sort(key=lambda x: x[1], reverse=True)
    return predictions[:top_k]

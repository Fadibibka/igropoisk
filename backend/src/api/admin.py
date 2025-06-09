from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select, and_, or_,case
from sqlalchemy.orm import joinedload
from datetime import datetime, timedelta
from typing import Optional, List
from datetime import datetime
from zoneinfo import ZoneInfo

moscow_time = datetime.now(ZoneInfo("Europe/Moscow"))
from src.config.db import get_db
from src.models.schemas import UserWithActivity
from src.models.models import User, UserRating
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(
    prefix="/api/users",
    tags=["Users Management"]
)

@router.get("/", response_model=List[UserWithActivity])
async def get_users(
    search: Optional[str] = Query(None, description="Поиск по логину"),
    sort_order: Optional[str] = Query("desc", description="Порядок сортировки (asc/desc)"),
    period_days: Optional[int] = Query(30, description="Период для подсчета активности в днях"),
    db: AsyncSession = Depends(get_db)
):
    try:
        # Определяем период для подсчета активности
        end_date = datetime.now(ZoneInfo("Europe/Moscow"))  # или с pytz
        start_date = end_date - timedelta(days=period_days)

        # Базовый запрос с подсчетом активности
        stmt = (
            select(
                User,
                func.count(
                    case(
                        (UserRating.created_at.between(start_date, end_date), 1)
                    )
                ).label("activity_score")
            )
            .join(UserRating, User.user_id == UserRating.user_id, isouter=True)
            .group_by(User.user_id)
        )
        # Применяем поиск по логину, если указан
        if search:
            stmt = stmt.where(User.login.ilike(f"%{search}%"))

        # Применяем сортировку
        if sort_order == "asc":
            stmt = stmt.order_by(func.count(UserRating.rating_id).asc())
        else:
            stmt = stmt.order_by(func.count(UserRating.rating_id).desc())

        # Выполняем запрос
        result = await db.execute(stmt)
        users_with_activity = result.all()

        # Формируем ответ с отзывами пользователей
        users = []
        for user, activity_score in users_with_activity:
            # Получаем отзывы пользователя
            ratings_stmt = (
                select(UserRating)
                .where(UserRating.user_id == user.user_id)
                .options(
                    joinedload(UserRating.game)
                )
                .order_by(UserRating.created_at.desc())
            )
            ratings_result = await db.execute(ratings_stmt)
            ratings = ratings_result.scalars().all()

            # Преобразуем в схему
            user_data = UserWithActivity(
                user_id=str(user.user_id),
                login=user.login,
                email=user.email,
                created_at=user.created_at,
                is_admin=user.is_admin,
                activity_score=activity_score or 0,
                reviews=[
                    {
                        "game_title": rating.game.title,
                        "text": rating.review_text,
                        "created_at": rating.created_at,
                        "rating_id": rating.rating_id
                    }
                    for rating in ratings
                ]
            )
            users.append(user_data)

        return users

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/reviews/{rating_id}")
async def delete_user_review(
    rating_id: int,
    db: AsyncSession = Depends(get_db)
):
    try:
        # Находим отзыв
        stmt = select(UserRating).where(UserRating.rating_id == rating_id)
        result = await db.execute(stmt)
        review = result.scalar_one_or_none()

        if not review:
            raise HTTPException(status_code=404, detail="Отзыв не найден")

        # Удаляем отзыв
        await db.delete(review)
        await db.commit()

        return {"message": "Отзыв успешно удален"}

    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
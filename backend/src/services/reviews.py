from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from src.models.models import UserRating
from typing import List
from uuid import UUID
from fastapi import Request, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, and_, func, case
from src.models.models import UserRating, Game, User, ReviewComment, ReviewReaction  # импорт Game
from src.models.schemas import UserRatingCreate, ReactionCreate, CommentCreate, CommentResponse, UserRatingWithGame
from src.middlewares.session_auth import get_current_user_id
from sqlalchemy.dialects.postgresql import insert as pg_insert

async def get_ratings_by_game_id(game_id: int, db: AsyncSession) -> List[UserRating]:
    # Основной запрос для отзывов с join пользователя и фильтром на наличие текста
    stmt = (
        select(
            UserRating.rating_id,
            UserRating.user_id,
            UserRating.game_id,
            UserRating.rating,
            UserRating.review_text,
            UserRating.created_at,
            UserRating.updated_at,
            User.login.label("user_login")
        )
        .join(User, UserRating.user_id == User.user_id)
        .where(
            and_(
                UserRating.game_id == game_id,
                UserRating.review_text.is_not(None),  # Только отзывы с текстом
                UserRating.review_text != ""          # И не пустые строки
            )
        )
    )
    result = await db.execute(stmt)
    reviews = result.mappings().all()
    
    # Для каждого отзыва получаем количество лайков/дизлайков/комментариев
    enriched_reviews = []
    for review in reviews:
        # Получаем количество лайков
        likes = await db.scalar(
            select(func.count())
            .where(
                and_(
                    ReviewReaction.review_id == review["rating_id"],
                    ReviewReaction.is_like == True
                )
            )
        ) or 0
        
        # Получаем количество дизлайков
        dislikes = await db.scalar(
            select(func.count())
            .where(
                and_(
                    ReviewReaction.review_id == review["rating_id"],
                    ReviewReaction.is_like == False
                )
            )
        ) or 0
        
        # Получаем количество комментариев
        comments = await db.scalar(
            select(func.count())
            .where(ReviewComment.review_id == review["rating_id"])
        ) or 0
        
        # Создаем обогащенный отзыв
        enriched_review = {
            "rating_id": review["rating_id"],
            "user_id": review["user_id"],
            "game_id": review["game_id"],
            "rating": float(review["rating"]),  # Конвертируем Decimal в float
            "review_text": review["review_text"],
            "created_at": review["created_at"],
            "updated_at": review["updated_at"],
            "user_login": review["user_login"],
            "likes": likes,
            "dislikes": dislikes,
            "comments": comments
        }
        enriched_reviews.append(enriched_review)
    
    return enriched_reviews

async def get_all_user_ratings(user_id: UUID, db: AsyncSession) -> List[UserRatingWithGame]:
    """Получает все оценки пользователя с названиями игр"""
    stmt = (
        select(
            UserRating.rating_id,
            UserRating.user_id,
            UserRating.game_id,
            UserRating.rating,
            UserRating.review_text,
            UserRating.created_at,
            UserRating.updated_at,
            User.login.label("user_login"),
            Game.title.label("game_title")  # Добавляем название игры
        )
        .join(User, UserRating.user_id == User.user_id)
        .join(Game, UserRating.game_id == Game.game_id)  # Присоединяем таблицу игр
        .where(
            and_(
                UserRating.user_id == user_id,
                UserRating.review_text.is_not(None),
                UserRating.review_text != ""
            )
        )
        .order_by(UserRating.created_at.desc())  # Сортировка по дате
    )
    result = await db.execute(stmt)
    reviews = result.mappings().all()
    
    enriched_reviews = []
    for review in reviews:
        likes = await db.scalar(
            select(func.count())
            .where(
                and_(
                    ReviewReaction.review_id == review["rating_id"],
                    ReviewReaction.is_like == True
                )
            )
        ) or 0
        
        dislikes = await db.scalar(
            select(func.count())
            .where(
                and_(
                    ReviewReaction.review_id == review["rating_id"],
                    ReviewReaction.is_like == False
                )
            )
        ) or 0
        
        comments = await db.scalar(
            select(func.count())
            .where(ReviewComment.review_id == review["rating_id"])
        ) or 0
        
        enriched_review = {
            "rating_id": review["rating_id"],
            "user_id": review["user_id"],
            "game_id": review["game_id"],
            "rating": float(review["rating"]),
            "review_text": review["review_text"],
            "created_at": review["created_at"],
            "updated_at": review["updated_at"],
            "user_login": review["user_login"],
            "game_title": review["game_title"],  # Добавляем название игры
            "likes": likes,
            "dislikes": dislikes,
            "comments": comments,
            "is_owner": True  # Все отзывы принадлежат текущему пользователю
        }
        enriched_reviews.append(enriched_review)
    
    return enriched_reviews

async def save_user_rating(
    request: Request,
    db: AsyncSession,
    data: UserRatingCreate
):
    user_id = get_current_user_id(request)

    stmt = pg_insert(UserRating).values(
        user_id=user_id,
        game_id=data.game_id,
        rating=data.rating,
        review_text=data.review_text
    ).on_conflict_do_update(
        index_elements=["user_id", "game_id"],
        set_={
            "rating": data.rating,
            "review_text": data.review_text,
        }
    )

    await db.execute(stmt)
    await db.commit()
    return {"detail": "Rating saved"}


async def get_user_rating(user_id: str, game_id: int, db: AsyncSession):
    result = await db.execute(
        select(UserRating).where(
            UserRating.user_id == user_id,
            UserRating.game_id == game_id
        )
    )
    return result.scalars().first()


async def delete_user_rating(game_id: int, request: Request, db: AsyncSession):
    user_id = get_current_user_id(request)

    result = await db.execute(
        select(UserRating).where(UserRating.user_id == user_id, UserRating.game_id == game_id)
    )
    rating = result.scalars().first()
    if not rating:
        raise HTTPException(status_code=404, detail="Rating not found")

    await db.delete(rating)
    await db.commit()
    return {"message": "Rating deleted"}

class ReviewReactionsService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def add_reaction(self, user_id: int, review_id: int, is_like: bool):
        # Используем review_id из URL, а не из тела запроса
        review = await self.db.execute(
            select(UserRating).where(UserRating.rating_id == review_id)
        )
        if not review.scalar_one_or_none():
            raise HTTPException(status_code=404, detail="Review not found")

        await self.db.execute(
            delete(ReviewReaction).where(
                and_(
                    ReviewReaction.user_id == user_id,
                    ReviewReaction.review_id == review_id
                )
            )
        )

        new_reaction = ReviewReaction(
            user_id=user_id,
            review_id=review_id,
            is_like=is_like
        )
        self.db.add(new_reaction)
        await self.db.commit()
        return new_reaction

    async def add_comment(self, user_id: UUID, review_id: int, text: str) -> UserRating:
        # Проверяем существование отзыва
        review = await self.db.execute(
            select(UserRating).where(UserRating.rating_id == review_id)
        )
        if not review.scalar_one_or_none():
            raise HTTPException(status_code=404, detail="Review not found")

        # Получаем логин пользователя
        user = await self.db.execute(
            select(User.login).where(User.user_id == user_id)
        )
        user_login = user.scalar_one()

        new_comment = ReviewComment(
            user_id=user_id,
            review_id=review_id,
            text=text
        )
        self.db.add(new_comment)
        await self.db.commit()
        await self.db.refresh(new_comment)

        return {
            "id": new_comment.id,
            "user_id": user_id,
            "review_id": review_id,
            "text": text,
            "created_at": new_comment.created_at,
            "user_login": user_login,
            "is_owner": True  # Поскольку это новый комментарий, он принадлежит текущему пользователю
        }

    async def get_review_comments(
        self,
        review_id: int,
        skip: int = 0,
        limit: int = 10,
        user_id: UUID | None = None
    ) -> List[UserRating]:
        stmt = (
            select(
                ReviewComment.id,
                ReviewComment.user_id,
                ReviewComment.review_id,
                ReviewComment.text,
                ReviewComment.created_at,
                User.login.label("user_login"),
                (ReviewComment.user_id == user_id).label("is_owner")
            )
            .join(User, ReviewComment.user_id == User.user_id)
            .where(ReviewComment.review_id == review_id)
            .order_by(ReviewComment.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        result = await self.db.execute(stmt)
        return result.mappings().all()

    async def remove_reaction(self, user_id: UUID, review_id: int):
        result = await self.db.execute(
            delete(ReviewReaction).where(
                and_(
                    ReviewReaction.user_id == user_id,
                    ReviewReaction.review_id == review_id
                )
            ).returning(ReviewReaction))
        await self.db.commit()
        return result.scalar_one_or_none()

    async def delete_comment(self, user_id: UUID, comment_id: UUID):
        comment = await self.db.execute(
            select(ReviewComment).where(
                and_(
                    ReviewComment.id == comment_id,
                    ReviewComment.user_id == user_id
                )
            )
        )
        comment = comment.scalar_one_or_none()
        if not comment:
            raise HTTPException(status_code=404, detail="Comment not found")

        await self.db.delete(comment)
        await self.db.commit()
        return True
        
    async def get_review_reactions(self, review_id: int):
        stmt = select(
            func.sum(case((ReviewReaction.is_like == True, 1), else_=0)).label("likes"),
            func.sum(case((ReviewReaction.is_like == False, 1), else_=0)).label("dislikes")
        ).where(ReviewReaction.review_id == review_id)
        result = await self.db.execute(stmt)
        return result.first()


    async def get_user_reaction(self, user_id: UUID, review_id: int):
        stmt = select(ReviewReaction).where(
            and_(
                ReviewReaction.user_id == user_id,
                ReviewReaction.review_id == review_id
            )
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()
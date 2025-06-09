from fastapi import APIRouter, Depends, status, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from src.config.db import get_db
from sqlalchemy.future import select
from src.services.reviews import get_ratings_by_game_id, save_user_rating, get_user_rating, delete_user_rating, ReviewReactionsService, get_all_user_ratings
from src.models.schemas import UserRatingOut, UserRatingCreate, GameReviewsResponse, ReactionCreate, CommentCreate, CommentResponse, UserRatingWithGame
from src.models.models import Game
from typing import List
from src.middlewares.session_auth import get_current_user_id 
from uuid import UUID

router = APIRouter(
    prefix="/api/ratings",
    tags=["Ratings"]
)

@router.get("/game/{game_id}", response_model=GameReviewsResponse)
async def get_ratings_for_game(
    game_id: int,
    db: AsyncSession = Depends(get_db)
):
    game_title = await db.scalar(
        select(Game.title).where(Game.game_id == game_id)
    )
    
    ratings = await get_ratings_by_game_id(game_id, db)
    
    return {
        "title": game_title or "Unknown Game",
        "reviews": ratings
    }

@router.get("/user/ratings", response_model=List[UserRatingWithGame])
async def get_all_user_ratings_route(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Получает все отзывы текущего пользователя с названиями игр"""
    user_id = get_current_user_id(request)
    return await get_all_user_ratings(user_id, db)

@router.post("/")
async def submit_rating(
    data: UserRatingCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    return await save_user_rating(request, db, data)

@router.get("/user/{game_id}")
async def get_user_rating_route(
    game_id: int,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    return await get_user_rating(user_id, game_id, db)

@router.delete("/{game_id}")
async def delete_user_rating_route(
    game_id: int,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    return await delete_user_rating(game_id, request, db)


@router.post("/{review_id}/reactions", status_code=status.HTTP_201_CREATED)
async def react_to_review(
    review_id: int,
    reaction_data: ReactionCreate,  # Теперь содержит только is_like
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    user_id = get_current_user_id(request)
    service = ReviewReactionsService(db)
    return await service.add_reaction(user_id, review_id, reaction_data.is_like)

@router.delete("/{review_id}/reactions", status_code=status.HTTP_200_OK)
async def remove_reaction(
    review_id: int,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    user_id = get_current_user_id(request)
    service = ReviewReactionsService(db)
    return await service.remove_reaction(user_id, review_id)


@router.post("/{review_id}/comments", status_code=status.HTTP_201_CREATED, response_model=CommentResponse)
async def add_comment(
    review_id: int,
    comment_data: CommentCreate,  # Теперь содержит только text
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    user_id = get_current_user_id(request)
    service = ReviewReactionsService(db)
    return await service.add_comment(user_id, review_id, comment_data.text)

@router.delete("/comments/{comment_id}", status_code=status.HTTP_200_OK)
async def delete_comment(
    comment_id: UUID,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    user_id = get_current_user_id(request)
    service = ReviewReactionsService(db)
    return await service.delete_comment(user_id, comment_id)

@router.get("/{review_id}/comments",  status_code=status.HTTP_200_OK, response_model=list[CommentResponse])
async def get_comments(
    review_id: int,
    request: Request,
    skip: int = 0,
    limit: int = 10,
    db: AsyncSession = Depends(get_db)
):
    user_id = request.session.get("user_id")
    service = ReviewReactionsService(db)
    comments = await service.get_review_comments(
        review_id=review_id,
        skip=skip,
        limit=limit,
        user_id=user_id
    )
    return comments

@router.get("/{review_id}/reactions", status_code=status.HTTP_200_OK)
async def get_reactions(
    review_id: int,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    user_id = get_current_user_id(request)
    service = ReviewReactionsService(db)
    
    # Получаем общее количество лайков/дизлайков
    reactions = await service.get_review_reactions(review_id)
    
    # Получаем реакцию текущего пользователя
    user_reaction = await service.get_user_reaction(user_id, review_id)
    
    return {
        "likes": reactions.likes or 0,
        "dislikes": reactions.dislikes or 0,
        "user_reaction": user_reaction.is_like if user_reaction else None
    }

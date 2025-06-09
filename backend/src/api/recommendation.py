from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from src.middlewares.session_auth import get_current_user_id
from src.models.models import Genre, Platform, UserGenreExclusion, UserPlatformExclusion
from src.models.schemas import GenreExclusionIn, GenreExclusionOut, PlatformExclusionIn, PlatformExclusionOut
from src.config.db import get_db
from src.services.recommendation_engine.recommendation_service import get_hybrid_recommendations
from typing import Any, Dict, List
import uuid

router = APIRouter(prefix="/api/recommendations", tags=["Recommendations"])

@router.get("/", response_model=Dict[str, List[Dict[str, Any]]])
async def get_recommendations(
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    try:
        result = await get_hybrid_recommendations(user_id, db)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Genre Exclusion Routes ---
@router.get("/exclusions/genres", response_model=List[GenreExclusionOut])
async def get_genre_exclusions(
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Genre.genre_id, Genre.name)
        .join(UserGenreExclusion, Genre.genre_id == UserGenreExclusion.genre_id)
        .where(UserGenreExclusion.user_id == user_id)
    )
    return [{"genre_id": gid, "name": name} for gid, name in result.all()]


@router.post("/exclusions/genres", status_code=201)
async def add_genre_exclusion(
    data: GenreExclusionIn,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    exclusion = UserGenreExclusion(user_id=user_id, genre_id=data.genre_id)
    db.add(exclusion)
    try:
        await db.commit()
    except Exception:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Already excluded or invalid genre_id")


@router.delete("/exclusions/genres", status_code=204)
async def remove_genre_exclusion(
    data: GenreExclusionIn,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    stmt = delete(UserGenreExclusion).where(
        UserGenreExclusion.user_id == user_id,
        UserGenreExclusion.genre_id == data.genre_id
    )
    await db.execute(stmt)
    await db.commit()


# --- Platform Exclusion Routes ---
@router.get("/exclusions/platforms", response_model=List[PlatformExclusionOut])
async def get_platform_exclusions(
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Platform.platform_id, Platform.name)
        .join(UserPlatformExclusion, Platform.platform_id == UserPlatformExclusion.platform_id)
        .where(UserPlatformExclusion.user_id == user_id)
    )
    return [{"platform_id": pid, "name": name} for pid, name in result.all()]


@router.post("/exclusions/platforms", status_code=201)
async def add_platform_exclusion(
    data: PlatformExclusionIn,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    exclusion = UserPlatformExclusion(user_id=user_id, platform_id=data.platform_id)
    db.add(exclusion)
    try:
        await db.commit()
    except Exception:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Already excluded or invalid platform_id")


@router.delete("/exclusions/platforms", status_code=204)
async def remove_platform_exclusion(
    data: PlatformExclusionIn,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    stmt = delete(UserPlatformExclusion).where(
        UserPlatformExclusion.user_id == user_id,
        UserPlatformExclusion.platform_id == data.platform_id
    )
    await db.execute(stmt)
    await db.commit()
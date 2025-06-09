from fastapi import APIRouter, Depends, HTTPException, Query, Request, status, UploadFile, File
from fastapi.responses import JSONResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
import shutil
import os
from uuid import uuid4
from uuid import UUID
from src.models.models import ArticleComment, User
from src.middlewares.session_auth import get_optional_user_id, require_admin, get_current_user_id, get_current_user 
from src.config.db import get_db
from src.services.articles import ArticleService
from src.models.schemas import ArticleByGameSchema, ArticleCommentCreate, ArticleCommentOut, ArticlePreviewSchema, FullArticleSchema, PendingArticleSchema, PlatformArticleCreateSchema, ArticleEditSchema, UserArticlePreviewSchema
upload_router = APIRouter()
router = APIRouter(prefix="/api/articles", tags=["Articles"])

UPLOAD_DIR = "public"

@upload_router.post("/api/uploads/image")
async def upload_image(file: UploadFile = File(...)):
    ext = os.path.splitext(file.filename)[1]
    filename = f"{uuid4().hex}{ext}"  # ← исправлено здесь
    file_path = os.path.join(UPLOAD_DIR, filename)

    os.makedirs(UPLOAD_DIR, exist_ok=True)  # создаём папку если нет

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {"filename": filename}
@router.post("/{article_id}/comments", response_model=ArticleCommentOut, status_code=status.HTTP_201_CREATED)
async def create_comment(
    article_id: UUID,
    comment: ArticleCommentCreate,
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id)  # <-- Переименуй user → user_id
):
    new_comment = ArticleComment(
        article_id=article_id,
        content=comment.content,
        user_id=user_id  # теперь всё ок
    )
    db.add(new_comment)
    await db.commit()  # не забудь await
    await db.refresh(new_comment)

    # если тебе нужен user_login и avatar_url — нужно их достать из БД:
    result = await db.execute(
        select(User.login, User.avatar_url).where(User.user_id == user_id)
    )
    user_row = result.one_or_none()

    return ArticleCommentOut(
        comment_id=new_comment.comment_id,
        article_id=new_comment.article_id,
        content=new_comment.content,
        created_at=new_comment.created_at,
        user_login=user_row.login if user_row else "unknown",
        is_owner=True
    )

@router.get("/", response_model=List[ArticlePreviewSchema])
async def get_all_articles_preview(
    is_official: Optional[bool] = Query(None, description="Фильтр по типу статьи: платформа (true) или сообщество (false)"),
    db: AsyncSession = Depends(get_db)
):
    """Получение списка всех одобренных статей с превью-информацией"""
    try:
        articles = await ArticleService.get_all_articles_preview(db, is_official=is_official)
        return articles
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"message": f"Ошибка при получении статей: {str(e)}"}
        )

@router.get("/{article_id}", response_model=FullArticleSchema)
async def get_full_article(
    article_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user_id: Optional[UUID] = Depends(get_optional_user_id)
):
    article = await ArticleService.get_full_article(
        db, 
        article_id,
        current_user_id
    )
    
    if not article:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Article not found"
        )
    
    return article

@router.post("/platform/create")
async def create_platform_article(
    article_data: PlatformArticleCreateSchema,
    db: AsyncSession = Depends(get_db),
    admin_user: User = Depends(get_current_user)  # предполагается зависимость проверки прав
):
    """Создание статьи платформы (только для админа)"""
    try:
        article_id = await ArticleService.create_platform_article(
            db=db,
            title=article_data.title,
            description=article_data.description,
            content=article_data.content,
            article_photo=article_data.article_photo,
            game_id=article_data.game_id
        )
        return {"message": "Статья успешно создана", "article_id": article_id}
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"message": f"Ошибка при создании статьи: {str(e)}"}
        )
    
@router.post("/user/create")
async def create_user_article(
    article_data: PlatformArticleCreateSchema,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)  # текущий пользователь из сессии
):
    """Создание статьи пользователем"""
    try:
        article_id = await ArticleService.create_user_article(
            db=db,
            user_id=user.user_id,
            title=article_data.title,
            description=article_data.description,
            content=article_data.content,
            article_photo=article_data.article_photo,
            game_id=article_data.game_id
        )
        return {"message": "Статья отправлена на модерацию", "article_id": article_id}
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"message": f"Ошибка при создании статьи: {str(e)}"}
        )

@router.put("/edit")
async def edit_article(
    article_data: ArticleEditSchema,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Редактирование статьи (пользователь или админ)"""
    try:
        success = await ArticleService.edit_article(
            db=db,
            article_id=article_data.article_id,
            title=article_data.title,
            description=article_data.description,
            content=article_data.content,
            article_photo=article_data.article_photo,
            game_id=article_data.game_id,
            user_id=user.user_id,
            is_admin=user.is_admin
        )
        if not success:
            raise HTTPException(status_code=404, detail="Статья не найдена или нет доступа")

        return {"message": "Статья успешно обновлена и отправлена на модерацию"}
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"message": f"Ошибка при редактировании статьи: {str(e)}"}
        )
    
@router.delete("/delete/{article_id}")
async def delete_article(
    article_id: UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Удаление статьи (автор или админ)"""
    try:
        success = await ArticleService.delete_article(
            db=db,
            article_id=article_id,
            user_id=user.user_id,
            is_admin=user.is_admin
        )
        if not success:
            raise HTTPException(status_code=404, detail="Статья не найдена или нет доступа")

        return {"message": "Статья успешно удалена"}
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"message": f"Ошибка при удалении статьи: {str(e)}"}
        )
    
@router.get("/user/articles", response_model=List[UserArticlePreviewSchema])
async def get_user_articles(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Получение статей текущего пользователя или платформенных (если админ)"""
    try:
        articles = await ArticleService.get_user_articles(
            db=db,
            user_id=user.user_id,
            is_admin=user.is_admin
        )
        return articles
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"message": f"Ошибка при получении статей пользователя: {str(e)}"}
        )
    
@router.get("/moderation/pending", response_model=List[PendingArticleSchema])
async def get_pending_articles(
    db: AsyncSession = Depends(get_db),
    admin_user: User = Depends(get_current_user)
):
    try:
        articles = await ArticleService.get_pending_articles(db)
        return articles
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"message": f"Ошибка при получении статей на модерацию: {str(e)}"}
        )
    
@router.post("/moderation/approve/{article_id}")
async def approve_article(
    article_id: UUID,
    db: AsyncSession = Depends(get_db),
    admin_user: User = Depends(get_current_user)
):
    try:
        success = await ArticleService.approve_article(db, article_id)
        if not success:
            raise HTTPException(status_code=404, detail="Статья не найдена")

        return {"message": "Статья успешно одобрена"}
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"message": f"Ошибка при одобрении статьи: {str(e)}"}
        )

@router.get("/by-game", response_model=List[ArticleByGameSchema])
async def get_articles_by_game(
    game_id: int = Query(..., description="ID игры"),
    db: AsyncSession = Depends(get_db)
):
    try:
        articles = await ArticleService.get_articles_by_game_id(game_id, db)
        return articles
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"message": f"Ошибка при получении статей для игры: {str(e)}"}
        )
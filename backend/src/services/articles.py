from datetime import datetime, timezone
from typing import List,Optional, Tuple
from sqlalchemy import case, select, func
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from src.models.models import Article, User, Game, ArticleReaction, ArticleComment
from src.models.schemas import ArticlePreviewSchema, FullArticleSchema, ArticleCommentSchema, ArticleReactionSchema, CommentAuthor
from sqlalchemy.orm import selectinload

class ArticleService:
    @staticmethod
    def get_time_ago(created_at):
        """Возвращает строку с указанием, как давно была создана статья"""
        now = datetime.now(timezone.utc)
        diff = now - created_at
        
        if diff.days > 0:
            return f"{diff.days} дн. назад"
        elif diff.seconds >= 3600:
            hours = diff.seconds // 3600
            return f"{hours} ч. назад"
        else:
            minutes = diff.seconds // 60
            return f"{minutes} мин. назад"

    @staticmethod
    async def get_all_articles_preview(
        db: AsyncSession,
        is_official: Optional[bool] = None
    ) -> List[ArticlePreviewSchema]:
        """Возвращает список предпросмотра только одобренных статей, с фильтром по официальности."""

        # Формируем базовый запрос
        stmt = select(Article).where(Article.is_approved.is_(True))

        # Применяем фильтр по типу статьи (официальная / пользовательская)
        if is_official is not None:
            stmt = stmt.where(Article.is_official.is_(is_official))

        stmt = stmt.order_by(Article.created_at.desc())

        # Получаем статьи
        articles_result = await db.execute(stmt)
        articles = articles_result.scalars().all()

        articles_preview = []
        for article in articles:
            # Автор
            author_name = "Статья платформы"
            author_avatar = "/default-avatar.png"
            if article.author_id:
                author_result = await db.execute(
                    select(User.login, User.avatar_url).where(User.user_id == article.author_id)
                )
                author = author_result.first()
                if author:
                    author_name, author_avatar = author
                    author_avatar = author_avatar or "/default-avatar.png"

            # Игра
            game_title = None
            if article.game_id:
                game_result = await db.execute(
                    select(Game.title).where(Game.game_id == article.game_id)
                )
                game_title = game_result.scalar_one_or_none()

            articles_preview.append({
                "article_id": article.article_id,
                "title": article.title,
                "description": article.description,
                "image_url": article.article_photo,
                "created_at": ArticleService.get_time_ago(article.created_at),
                "views_count": article.views_count,
                "author": {
                    "name": author_name,
                    "avatar": author_avatar
                },
                "game_title": game_title
            })

        return articles_preview

    @staticmethod
    async def get_full_article(
        db: AsyncSession, 
        article_id: UUID, 
        current_user_id: Optional[UUID] = None
    ) -> Optional[FullArticleSchema]:
        # Получаем основную информацию о статье
        article_result = await db.execute(
            select(Article)
            .options(
                selectinload(Article.author),
                selectinload(Article.game)
            )
            .where(Article.article_id == article_id)
        )
        article = article_result.scalar_one_or_none()
        
        if not article:
            return None

        # Увеличиваем счетчик просмотров
        article.views_count += 1
        await db.commit()
        await db.refresh(article)

        # Получаем комментарии с иерархией
        comments = await ArticleService._get_article_comments(db, article_id)

        # Получаем реакции (лайки/дизлайки)
        reactions = await ArticleService._get_article_reactions(db, article_id, current_user_id)

        # Формируем ответ
        return FullArticleSchema(
            article_id=article.article_id,
            title=article.title,
            content=article.content,
            description=article.description,
            image_url=article.article_photo,
            created_at=article.created_at,
            updated_at=article.updated_at,
            views_count=article.views_count,
            author=CommentAuthor(
                user_id=article.author.user_id,
                name=article.author.login,
                avatar=article.author.avatar_url
            ) if article.author else CommentAuthor(
                user_id=None,
                name="Статья платформы",
                avatar="/official-avatar.png"
            ),
            game_title=article.game.title if article.game else None,
            is_official=article.is_official,
            comments=comments,
            reactions=reactions
        )

    @staticmethod
    async def _get_article_comments(db: AsyncSession, article_id: UUID) -> List[ArticleCommentSchema]:
        # Получаем все комментарии к статье
        comments_result = await db.execute(
            select(ArticleComment, User)
            .join(User, ArticleComment.user_id == User.user_id)
            .where(ArticleComment.article_id == article_id)
            .order_by(ArticleComment.created_at)
        )
        
        # Строим иерархию комментариев
        comments_map = {}
        root_comments = []
        
        for comment, user in comments_result:
            comment_schema = ArticleCommentSchema(
                comment_id=comment.comment_id,
                author=CommentAuthor(
                    user_id=user.user_id,
                    name=user.login,
                    avatar=user.avatar_url
                ),
                content=comment.content,
                created_at=comment.created_at,
                replies=[]
            )
            
            comments_map[comment.comment_id] = comment_schema
            
            if comment.parent_comment_id:
                parent = comments_map.get(comment.parent_comment_id)
                if parent:
                    parent.replies.append(comment_schema)
            else:
                root_comments.append(comment_schema)
        
        return root_comments

    @staticmethod
    async def _get_article_reactions(
        db: AsyncSession, 
        article_id: UUID, 
        current_user_id: Optional[UUID] = None
    ) -> ArticleReactionSchema:
        # Получаем общее количество лайков/дизлайков
        reactions_result = await db.execute(
            select(
                func.sum(case((ArticleReaction.is_like == True, 1), else_=0)).label("likes"),
                func.sum(case((ArticleReaction.is_like == False, 1), else_=0)).label("dislikes")
            )
            .where(ArticleReaction.article_id == article_id)
        )
        likes, dislikes = reactions_result.first() or (0, 0)
        
        # Получаем реакцию текущего пользователя (если он авторизован)
        user_reaction = None
        if current_user_id:
            user_reaction_result = await db.execute(
                select(ArticleReaction.is_like)
                .where(
                    (ArticleReaction.article_id == article_id) &
                    (ArticleReaction.user_id == current_user_id)
                )
            )
            user_reaction = user_reaction_result.scalar_one_or_none()
        
        return ArticleReactionSchema(
            likes_count=likes or 0,
            dislikes_count=dislikes or 0,
            user_reaction=user_reaction
        )
    
    @staticmethod
    async def create_platform_article(
        db: AsyncSession,
        title: str,
        description: str,
        content: str,
        article_photo: Optional[str] = None,
        game_id: Optional[UUID] = None
    ) -> UUID:
        """Создание статьи платформы (от имени администратора)"""
        new_article = Article(
            title=title,
            description=description,
            content=content,
            article_photo=article_photo,
            game_id=game_id,
            is_official=True,
            is_approved=True,
            created_at=datetime.utcnow()
        )
        db.add(new_article)
        await db.commit()
        await db.refresh(new_article)
        return new_article.article_id
    
    @staticmethod
    async def create_user_article(
        db: AsyncSession,
        user_id: UUID,
        title: str,
        description: str,
        content: str,
        article_photo: Optional[str] = None,
        game_id: Optional[UUID] = None
    ) -> UUID:
        """Создание статьи пользователем"""
        new_article = Article(
            title=title,
            description=description,
            content=content,
            article_photo=article_photo,
            game_id=game_id,
            author_id=user_id,
            is_official=False,
            is_approved=False,
            created_at=datetime.utcnow()
        )
        db.add(new_article)
        await db.commit()
        await db.refresh(new_article)
        return new_article.article_id
    
    @staticmethod
    async def edit_article(
        db: AsyncSession,
        article_id: UUID,
        title: str,
        description: str,
        content: str,
        article_photo: Optional[str],
        game_id: Optional[UUID],
        user_id: UUID,
        is_admin: bool = False
    ) -> bool:
        """Редактирование статьи пользователем или админом"""
        stmt = select(Article).where(Article.article_id == article_id)
        if not is_admin:
            stmt = stmt.where(Article.author_id == user_id)

        result = await db.execute(stmt)
        article = result.scalar_one_or_none()
        if not article:
            return False

        article.title = title
        article.description = description
        article.content = content
        article.article_photo = article_photo
        article.game_id = game_id
        if not is_admin:
            article.is_approved = False

        await db.commit()
        return True
    
    @staticmethod
    async def delete_article(
        db: AsyncSession,
        article_id: UUID,
        user_id: UUID,
        is_admin: bool = False
    ) -> bool:
        """Удаление статьи пользователем или админом"""
        stmt = select(Article).where(Article.article_id == article_id)
        if not is_admin:
            stmt = stmt.where(Article.author_id == user_id)

        result = await db.execute(stmt)
        article = result.scalar_one_or_none()

        if not article:
            return False

        await db.delete(article)
        await db.commit()
        return True
    
    @staticmethod
    async def get_user_articles(
        db: AsyncSession,
        user_id: UUID,
        is_admin: bool = False
    ) -> List[dict]:
        """Получение статей пользователя с указанием статуса. Админ получает статьи платформы."""
        if is_admin:
            stmt = select(Article).where(Article.is_official == True).order_by(Article.created_at.desc())
        else:
            stmt = select(Article).where(Article.author_id == user_id).order_by(Article.created_at.desc())

        result = await db.execute(stmt)
        articles = result.scalars().all()

        article_list = []
        for article in articles:
            game_title = None
            if article.game_id:
                game_result = await db.execute(
                    select(Game.title).where(Game.game_id == article.game_id)
                )
                game_title = game_result.scalar_one_or_none()

            article_list.append({
                "article_id": article.article_id,
                "title": article.title,
                "description": article.description,
                "article_photo": article.article_photo,
                "created_at": ArticleService.get_time_ago(article.created_at),
                "is_approved": article.is_approved,
                "is_official": article.is_official,
                "game_title": game_title,
            })

        return article_list
    
    @staticmethod
    async def get_pending_articles(db: AsyncSession) -> List[dict]:
        """Получение статей, ожидающих модерации"""
        stmt = select(Article).where(Article.is_approved == False).order_by(Article.created_at.desc())
        result = await db.execute(stmt)
        articles = result.scalars().all()

        pending_articles = []
        for article in articles:
            game_title = None
            if article.game_id:
                game_result = await db.execute(
                    select(Game.title).where(Game.game_id == article.game_id)
                )
                game_title = game_result.scalar_one_or_none()

            author_name = "Неизвестно"
            if article.author_id:
                author_result = await db.execute(
                    select(User.login).where(User.user_id == article.author_id)
                )
                author = author_result.scalar_one_or_none()
                if author:
                    author_name = author

            pending_articles.append({
                "article_id": article.article_id,
                "title": article.title,
                "description": article.description,
                "article_photo": article.article_photo,
                "created_at": ArticleService.get_time_ago(article.created_at),
                "author_name": author_name,
                "game_title": game_title,
                "is_official": article.is_official
            })

        return pending_articles
    
    @staticmethod
    async def approve_article(db: AsyncSession, article_id: UUID) -> bool:
        """Одобрение статьи (is_approved = True)"""
        result = await db.execute(select(Article).where(Article.article_id == article_id))
        article = result.scalar_one_or_none()
        if not article:
            return False

        article.is_approved = True
        await db.commit()
        return True
    
    @staticmethod
    async def get_articles_by_game_id(game_id: int, db: AsyncSession) -> List[dict]:
        """Получение статей по ID игры"""
        stmt = select(Article).where(Article.game_id == game_id, Article.is_approved == True).order_by(Article.created_at.desc())
        result = await db.execute(stmt)
        articles = result.scalars().all()

        game_articles = []
        for article in articles:
            game_title = None
            if article.game_id:
                game_result = await db.execute(
                    select(Game.title).where(Game.game_id == article.game_id)
                )
                game_title = game_result.scalar_one_or_none()

            author_name = "Неизвестно"
            if article.author_id:
                author_result = await db.execute(
                    select(User.login).where(User.user_id == article.author_id)
                )
                author = author_result.scalar_one_or_none()
                if author:
                    author_name = author

            game_articles.append({
                "article_id": article.article_id,
                "title": article.title,
                "description": article.description,
                "article_photo": article.article_photo,
                "author_name": author_name,
                "game_title": game_title,
                "is_official": article.is_official
            })

        return game_articles
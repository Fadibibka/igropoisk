import uuid
from sqlalchemy import (
    Column, String, Integer, Boolean, Date, ForeignKey, Text, Float,
    Numeric, TIMESTAMP, UniqueConstraint, func
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship, Mapped, mapped_column, declarative_base
from typing import List

from .base import Base

class Article(Base):
    __tablename__ = "articles"

    article_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(TIMESTAMP(timezone=True))
    author_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id", ondelete="CASCADE"))
    game_id = Column(Integer, ForeignKey("games.game_id", ondelete="SET NULL"))
    is_official = Column(Boolean, default=False)
    is_approved = Column(Boolean, default=False)
    views_count = Column(Integer, default=0)
    description = Column(String(200), nullable=False)
    article_photo = Column(Text, nullable=False)
    author = relationship("User")
    game = relationship("Game")
    comments = relationship("ArticleComment", back_populates="article", cascade="all, delete-orphan")
    likes = relationship("ArticleReaction", back_populates="article", cascade="all, delete-orphan")

class ArticleComment(Base):
    __tablename__ = "article_comments"

    comment_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    article_id = Column(UUID(as_uuid=True), ForeignKey("articles.article_id", ondelete="CASCADE"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id", ondelete="CASCADE"))
    content = Column(Text, nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
    parent_comment_id = Column(UUID(as_uuid=True), ForeignKey("article_comments.comment_id", ondelete="CASCADE"))
    
    article = relationship("Article", back_populates="comments")
    user = relationship("User")
    parent = relationship("ArticleComment", remote_side=[comment_id], backref="replies")

class ArticleReaction(Base):
    __tablename__ = "article_reactions"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id", ondelete="CASCADE"), primary_key=True)
    article_id = Column(UUID(as_uuid=True), ForeignKey("articles.article_id", ondelete="CASCADE"), primary_key=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
    is_like = Column(Boolean, nullable=False)  # True for like, False for dislike
    article = relationship("Article", back_populates="likes")
    user = relationship("User")
class User(Base):
    __tablename__ = "users"

    user_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    login = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    avatar_url = Column(String(255))
    password = Column(Text, nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
    is_admin = Column(Boolean, default=False)
    bday = Column(Date)
    ratings = relationship("UserRating", back_populates="user")


class Game(Base):
    __tablename__ = "games"

    game_id = Column(Integer, primary_key=True)
    title = Column(String(255), nullable=False)
    developer = Column(String(100))
    publisher = Column(String(100))
    release_date = Column(Date)
    description = Column(Text)
    steam_url = Column(Text)
    average_user_rating = Column(Numeric(3, 2))
    age_rating = Column(String(20))
    average_critic_rating = Column(Numeric(3, 2))
    average_critic_rec = Column(Numeric(3, 2))
    about_game = Column(Text)
    steam_rating = Column(String(50))

    materials = relationship("GameMaterial", backref="game", cascade="all, delete", lazy="selectin")
    genres = relationship("Genre", secondary="game_genres", backref="games", lazy="selectin")
    ratings = relationship("UserRating", back_populates="game")



class Platform(Base):
    __tablename__ = "platforms"

    platform_id = Column(Integer, primary_key=True)
    name = Column(String(50), unique=True, nullable=False)
    manufacturer = Column(String(100))
    release_date = Column(Date)
    description = Column(Text)
    logo_url = Column(String(255))


class GamePlatform(Base):
    __tablename__ = "game_platforms"

    game_id = Column(Integer, ForeignKey("games.game_id", ondelete="CASCADE"), primary_key=True)
    platform_id = Column(Integer, ForeignKey("platforms.platform_id", ondelete="CASCADE"), primary_key=True)


class Genre(Base):
    __tablename__ = "genres"

    genre_id = Column(Integer, primary_key=True)
    name = Column(String(50), unique=True, nullable=False)
    description = Column(Text)


class GameGenre(Base):
    __tablename__ = "game_genres"

    game_id = Column(Integer, ForeignKey("games.game_id", ondelete="CASCADE"), primary_key=True)
    genre_id = Column(Integer, ForeignKey("genres.genre_id", ondelete="CASCADE"), primary_key=True)

class ReviewReaction(Base):
    __tablename__ = "review_reactions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False)
    review_id = Column(Integer, ForeignKey("user_ratings.rating_id", ondelete="CASCADE"), nullable=False)
    is_like = Column(Boolean, nullable=False)  # True for like, False for dislike
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    review = relationship("UserRating", back_populates="reactions")

class ReviewComment(Base):
    __tablename__ = "review_comments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False)
    review_id = Column(Integer, ForeignKey("user_ratings.rating_id", ondelete="CASCADE"), nullable=False)
    text = Column(Text, nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    review = relationship("UserRating", back_populates="comments")  # Исправлено здесь
    user = relationship("User")

class UserRating(Base):
    __tablename__ = "user_ratings"
    __table_args__ = (
        UniqueConstraint("user_id", "game_id", name="unique_user_game_rating"),
    )

    rating_id = Column(Integer, primary_key=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id", ondelete="CASCADE"))
    game_id = Column(Integer, ForeignKey("games.game_id", ondelete="CASCADE"))
    rating = Column(Numeric(2, 1), nullable=False)
    review_text = Column(Text)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    game = relationship("Game", back_populates="ratings")
    user = relationship("User", back_populates="ratings")
    reactions = relationship("ReviewReaction", back_populates="review", cascade="all, delete-orphan")
    comments = relationship("ReviewComment", back_populates="review", cascade="all, delete-orphan")



class UserFavorite(Base):
    __tablename__ = "user_favorites"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id", ondelete="CASCADE"), primary_key=True)
    game_id = Column(Integer, ForeignKey("games.game_id", ondelete="CASCADE"), primary_key=True)
    added_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
    game = relationship("Game")

class UserPlayed(Base):
    __tablename__ = "user_played"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id", ondelete="CASCADE"), primary_key=True)
    game_id = Column(Integer, ForeignKey("games.game_id", ondelete="CASCADE"), primary_key=True)
    added_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
    game = relationship("Game")

class GameMaterial(Base):
    __tablename__ = "game_materials"

    screenshot_id = Column(Integer, primary_key=True)
    game_id = Column(Integer, ForeignKey("games.game_id", ondelete="CASCADE"))
    material_url = Column(String(255), nullable=False)
    material_type = Column(String(100))
    upload_date = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)


class Recommendation(Base):
    __tablename__ = "recommendations"

    recommendation_id = Column(Integer, primary_key=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id", ondelete="CASCADE"))
    game_id = Column(Integer, ForeignKey("games.game_id", ondelete="CASCADE"))
    recommended_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
    algorithm_source = Column(String(50), nullable=False)
    confidence_score = Column(Numeric(3, 2))
    is_viewed = Column(Boolean, default=False)
    is_interacted = Column(Boolean, default=False)
    explanation = Column(String)

class UserGenreExclusion(Base):
    __tablename__ = "user_genre_exclusions"

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.user_id", ondelete="CASCADE"), primary_key=True)
    genre_id: Mapped[int] = mapped_column(ForeignKey("genres.genre_id", ondelete="CASCADE"), primary_key=True)


class UserPlatformExclusion(Base):
    __tablename__ = "user_platform_exclusions"

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.user_id", ondelete="CASCADE"), primary_key=True)
    platform_id: Mapped[int] = mapped_column(ForeignKey("platforms.platform_id", ondelete="CASCADE"), primary_key=True)


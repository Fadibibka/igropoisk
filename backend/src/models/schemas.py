from pydantic import BaseModel, EmailStr, condecimal
from typing import List, Optional
from datetime import date
from uuid import UUID
from datetime import datetime

class GameMaterialOut(BaseModel):
    material_url: str
    material_type: Optional[str]

    class Config:
        orm_mode = True

class GenreWithLogos(BaseModel):
    genre_id: int
    genre_name: str
    logos: List[str]

    class Config:
        orm_mode = True
class ExplanationModel(BaseModel):
    game_id: int
    title: str
    final_score: float
    components: dict
    priority_bonuses: list
    why_recommended: List[str]

class ReactionCreate(BaseModel):
    is_like: bool  # Только это поле теперь в теле запроса

class CommentCreate(BaseModel):
    text: str  # Только это поле теперь в теле запроса

class CommentResponse(BaseModel):
    id: UUID  # Изменено с int на UUID
    user_id: UUID  # Изменено с int на UUID
    review_id: int  # Изменено с int на UUID
    text: str
    created_at: datetime
    user_login: str
    is_owner: bool

    class Config:
        from_attributes = True  # Заменяем orm_mode = True в Pydantic v2

class GenreOut(BaseModel):
    genre_id: int
    name: str
    description: Optional[str] = None

    class Config:
        orm_mode = True

class UserCreate(BaseModel):
    login: str
    email: EmailStr
    password: str
class GameShortOut(BaseModel):
    game_id: int
    title: str
    developer: Optional[str]
    genres: List[str]
    explanation: ExplanationModel  # если explanation уже приведен к модели

    class Config:
        orm_mode = True

class UserReview(BaseModel):
    game_title: str
    text: Optional[str]
    created_at: datetime
    rating_id: int

class UserWithActivity(BaseModel):
    user_id: str
    login: str
    email: str
    created_at: datetime
    is_admin: bool
    activity_score: int
    reviews: List[UserReview]
    
class UserUpdate(BaseModel):
    login: Optional[str] = None
    email: Optional[EmailStr] = None
    avatar_url: Optional[str] = None
    password: Optional[str] = None
    
class UsersOut(BaseModel):
    login: Optional[str]
    email: Optional[EmailStr]
    created_at: datetime
    is_admin: bool

class ArticleAuthorSchema(BaseModel):
    name: str

class ArticlePreviewSchema(BaseModel):
    article_id: UUID
    title: str
    description: str
    image_url: str
    created_at: str
    views_count: int
    author: ArticleAuthorSchema
    game_title: Optional[str] = None

class PlatformArticleCreateSchema(BaseModel):
    title: str
    description: str
    content: str
    article_photo: Optional[str] = None
    game_id: Optional[UUID] = None
    
class ArticleCommentCreate(BaseModel):
    article_id: UUID
    content: str
class GenreOut(BaseModel):
    genre_id: int
    name: str
    description: Optional[str] = None

    class Config:
        orm_mode = True

class GenreExclusionIn(BaseModel):
    genre_id: int

class PlatformExclusionIn(BaseModel):
    platform_id: int

class GenreExclusionOut(BaseModel):
    genre_id: int
    name: str

class PlatformExclusionOut(BaseModel):
    platform_id: int
    name: str

class DevelopersOut(BaseModel):
    developer: str

    class Config:
        orm_mode = True
class UserArticlePreviewSchema(BaseModel):
    article_id: UUID
    title: str
    description: str
    article_photo: Optional[str]
    created_at: str
    is_approved: bool
    is_official: bool
    game_title: Optional[str]
class ArticleByGameSchema(BaseModel):
    article_id: int
    title: str
    description: str
    article_photo: Optional[str]
    created_at: str
    author_name: str
    game_title: Optional[str]
    is_official: bool
class PendingArticleSchema(BaseModel):
    article_id: UUID
    title: str
    description: str
    article_photo: Optional[str]
    created_at: str
    author_name: str
    game_title: Optional[str]
    is_official: bool

class ArticleCommentOut(BaseModel):
    comment_id: UUID
    article_id: UUID
    content: str
    created_at: datetime
    user_login: str
    is_owner: bool

    class Config:
        orm_mode = True
class ArticleEditSchema(BaseModel):
    article_id: UUID
    title: str
    description: str
    content: str
    article_photo: Optional[str] = None
    game_id: Optional[UUID] = None

class CommentAuthor(BaseModel):
    user_id: Optional[UUID]
    name: str
    avatar: Optional[str]

class ArticleCommentSchema(BaseModel):
    comment_id: UUID
    author: CommentAuthor
    content: str
    created_at: datetime
    replies: List['ArticleCommentSchema'] = []

class ArticleReactionSchema(BaseModel):
    likes_count: int
    dislikes_count: int
    user_reaction: Optional[bool] = None  # True=like, False=dislike, None=нет реакции

class FullArticleSchema(BaseModel):
    article_id: UUID
    title: str
    content: str
    description: str
    image_url: str
    created_at: datetime
    updated_at: Optional[datetime]
    views_count: int
    author: CommentAuthor
    game_title: Optional[str]
    is_official: bool
    comments: List[ArticleCommentSchema]
    reactions: ArticleReactionSchema

class GameOut(BaseModel):
    game_id: int
    title: str
    developer: Optional[str]
    publisher: Optional[str]
    release_date: date
    description: Optional[str]
    steam_url: Optional[str]
    average_user_rating: Optional[float]
    age_rating: Optional[str]
    average_critic_rating: Optional[float]
    average_critic_rec: Optional[float]
    about_game: Optional[str]
    materials: List[GameMaterialOut] = []
    genres: List[GenreOut]
    steam_rating: Optional[str]
    class Config:
        orm_mode = True



class RelatedGenreOut(BaseModel):
    genre_id: int
    name: str
    overlap_count: int

class TopGamesByGenreOut(BaseModel):
    genre_name: str
    games: List[GameOut]

class UserRatingCreate(BaseModel):
    game_id: int
    rating: condecimal(gt=0, le=5, max_digits=2, decimal_places=1)
    review_text: Optional[str] = None

# Assuming UserRating is your SQLAlchemy model
class UserRatingOut(BaseModel):
    rating_id: int
    user_id: UUID
    user_login: str
    review_text: str
    rating: float
    created_at: datetime
    updated_at: datetime
    game_id: int
    likes: int
    dislikes: int
    comments: int

    class Config:
        orm_mode = True
class UserRatingWithGame(BaseModel):
    rating_id: int
    user_id: UUID
    game_id: int
    rating: float
    review_text: str
    created_at: datetime
    updated_at: datetime
    user_login: str
    game_title: str  # Название игры
    likes: int
    dislikes: int
    comments: int
    is_owner: bool

    class Config:
        from_attributes = True

class GameReviewsResponse(BaseModel):
    title: str
    reviews: List[UserRatingOut]

# Pydantic модели
class UserExclusions(BaseModel):
    excluded_genres: List[int] = []
    excluded_platforms: List[int] = []
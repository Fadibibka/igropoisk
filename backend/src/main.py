from src.api import game_routes
from src.api import categories_routes
from src.api import reviews
from src.api import auth
from src.api import favorite_routes
from src.api import played_routes
from src.api import userinfo_routes
from src.api import articles
from src.api.articles import upload_router
from src.api import admin
from src.api import recommendation
from fastapi import FastAPI
from starlette.middleware.sessions import SessionMiddleware
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import redis
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
public_dir = os.path.join(backend_dir, "public")

app = FastAPI()

# Настройка Redis
redis_client = redis.Redis(
    host='195.133.27.2',
    port=6379,
    username='default',
    password='\kv;R56//|E5nH',
    decode_responses=True
)

# Инициализация кеша
@app.on_event("startup")
async def startup():
    FastAPICache.init(RedisBackend(redis_client), prefix="fastapi-cache")

app.add_middleware(
    SessionMiddleware,
    secret_key="bizurewkvkypljiqxaezeispkfxzekpw",
    session_cookie="session_id",
    same_site="lax",
    https_only=False,  # True в production
    max_age=3600*24  # 24 часа
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Ваш фронтенд URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]  # Добавьте эту строку
)

app.mount("/public", StaticFiles(directory=public_dir), name="public")

app.include_router(game_routes.router)
app.include_router(categories_routes.router)
app.include_router(articles.router)
app.include_router(reviews.router)
app.include_router(auth.router)
app.include_router(favorite_routes.router)
app.include_router(played_routes.router)
app.include_router(userinfo_routes.router)
app.include_router(admin.router)
app.include_router(recommendation.router)
app.include_router(upload_router)
frontend_build_dir = os.path.join(backend_dir, "..", "frontend", "dist") 
app.mount("/", StaticFiles(directory=frontend_build_dir, html=True), name="frontend")
from fastapi import APIRouter, Depends, Request, Response
from sqlalchemy.ext.asyncio import AsyncSession
from src.config.db import get_db
from src.models.schemas import UserCreate
from src.services.auth import register_user, login_user, logout_user
from src.middlewares.session_auth import get_current_user_id

router = APIRouter(prefix="/api/auth", tags=["Auth"])

@router.post("/reg")
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    user = await register_user(db, user_data)
    return {"message": "User registered", "user_id": str(user.user_id)}

@router.post("/login")
async def login(request: Request, data: dict, db: AsyncSession = Depends(get_db)):
    login_value = data.get("login")
    password = data.get("password")
    user = await login_user(request, db, login_value, password)
    return {"message": "Logged in", "user_id": str(user.user_id)}

@router.post("/logout")
async def logout(request: Request):
    logout_user(request)
    return {"message": "Logged out"}

@router.post("/me")
def get_current_user(request: Request):
    user_id = get_current_user_id(request)
    return {
        "user_id": user_id,
        "is_admin": request.session.get("is_admin", False)
    }
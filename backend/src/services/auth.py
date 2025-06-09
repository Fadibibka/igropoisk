import uuid
from fastapi import HTTPException, Request, Response, status
from passlib.hash import bcrypt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from sqlalchemy.exc import NoResultFound

from src.models.models import User
from src.models.schemas import UserCreate
from starlette.middleware.sessions import SessionMiddleware


async def register_user(db: AsyncSession, user_data: UserCreate):
    result = await db.execute(
        select(User).where(
            or_(User.login == user_data.login, User.email == user_data.email)
        )
    )
    existing = result.scalars().first()

    if existing:
        raise HTTPException(status_code=400, detail="User with this login or email already exists")

    user = User(
        login=user_data.login,
        email=user_data.email,
        password=bcrypt.hash(user_data.password)
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def login_user(request: Request, db: AsyncSession, login_or_email: str, password: str):
    # Проверяем, содержит ли ввод символ @ (предполагаем, что это email)
    if '@' in login_or_email:
        query = select(User).where(User.email == login_or_email)
    else:
        query = select(User).where(User.login == login_or_email)
    
    result = await db.execute(query)
    user = result.scalars().first()

    if not user or not bcrypt.verify(password, user.password):
        raise HTTPException(status_code=401, detail="Invalid login or password")

    request.session['user_id'] = str(user.user_id)
    request.session['is_admin'] = user.is_admin
    print(request.session)
    return user

def logout_user(request: Request):
    request.session.clear()

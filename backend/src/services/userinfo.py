from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from uuid import UUID
from fastapi import HTTPException, status
from src.models.models import User

class UserService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def update_user(
        self,
        user_id: UUID,
        update_data: dict
    ) -> User:
        # Проверяем существование пользователя
        result = await self.db.execute(select(User).where(User.user_id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        # Обновляем только разрешенные поля
        allowed_fields = {'login', 'email', 'avatar_url', 'password'}
        update_fields = {k: v for k, v in update_data.items() if k in allowed_fields and v is not None}

        if not update_fields:
            return user

        # Выполняем обновление
        await self.db.execute(
            update(User)
            .where(User.user_id == user_id)
            .values(**update_fields)
        )
        await self.db.commit()
        await self.db.refresh(user)
        return user
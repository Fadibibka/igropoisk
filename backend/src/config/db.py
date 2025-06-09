from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base
from fastapi import Depends

DATABASE_URL = "postgresql+asyncpg://gen_user:DcHu%3C5%23vKzj%7BNS@217.199.253.30:5432/default_db"

engine = create_async_engine(DATABASE_URL, echo=True)
async_session = async_sessionmaker(engine, expire_on_commit=False)
Base = declarative_base()

async def get_db() -> AsyncSession:
    async with async_session() as session:
        yield session

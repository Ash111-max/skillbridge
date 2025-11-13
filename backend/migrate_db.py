"""
Migration script to add user_id column to existing interviews table
"""
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv
import os

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

async def migrate():
    engine = create_async_engine(DATABASE_URL, echo=True)
    
    async with engine.begin() as conn:
        # Check if user_id column exists
        result = await conn.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='interviews' AND column_name='user_id'
        """))
        
        if result.fetchone() is None:
            print("Adding user_id column to interviews table...")
            await conn.execute(text("""
                ALTER TABLE interviews 
                ADD COLUMN user_id INTEGER REFERENCES users(id)
            """))
            print("✅ Column added successfully!")
        else:
            print("✅ user_id column already exists!")
    
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(migrate())
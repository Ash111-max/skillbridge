import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from dotenv import load_dotenv
import os
from datetime import datetime

# Import all models
from db_models import Base, User, Interview, UserProgress

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL not found in .env")

print(f"🔗 Connecting to database...")
print(f"   URL: {DATABASE_URL.split('@')[1] if '@' in DATABASE_URL else 'local'}")

engine = create_async_engine(DATABASE_URL, echo=True, future=True)

async def init():
    try:
        async with engine.begin() as conn:
            print("\n🔨 Creating database tables...")
            
            # Drop all tables (CAREFUL: This deletes all data!)
            # Uncomment the next line if you want to recreate tables from scratch
            # await conn.run_sync(Base.metadata.drop_all)
            
            # Create all tables
            await conn.run_sync(Base.metadata.create_all)
        
        print("\n✅ Database tables created successfully!")
        print("📋 Tables created:")
        print("   - users (User accounts)")
        print("   - interviews (Interview records)")
        print("   - user_progress (Progress tracking)")
        print("\n🚀 You can now run: python -m uvicorn main:app --reload")
        
    except Exception as e:
        print(f"\n❌ Error creating database tables:")
        print(f"   {str(e)}")
        print("\n💡 Make sure:")
        print("   1. PostgreSQL is running")
        print("   2. Database exists (run: python setup_postgres.py for help)")
        print("   3. DATABASE_URL in .env is correct")
        raise

if __name__ == "__main__":
    asyncio.run(init())
"""
PostgreSQL Database Setup Script
This script helps you set up PostgreSQL for SkillBridge
"""

import os
import sys
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("❌ DATABASE_URL not found in .env file")
    sys.exit(1)

# Parse database URL
if DATABASE_URL.startswith("postgresql+asyncpg://"):
    # Extract connection details
    url_parts = DATABASE_URL.replace("postgresql+asyncpg://", "").split("@")
    
    if len(url_parts) == 2:
        user_pass = url_parts[0].split(":")
        host_db = url_parts[1].split("/")
        
        username = user_pass[0]
        password = user_pass[1] if len(user_pass) > 1 else ""
        host_port = host_db[0].split(":")
        host = host_port[0]
        port = host_port[1] if len(host_port) > 1 else "5432"
        database = host_db[1] if len(host_db) > 1 else "skillbridge"
        
        print("📋 PostgreSQL Connection Details:")
        print(f"   Host: {host}")
        print(f"   Port: {port}")
        print(f"   Database: {database}")
        print(f"   Username: {username}")
        print()
        
        print("🔧 To create the database, run these commands in PostgreSQL:")
        print(f"   psql -U postgres")
        print(f"   CREATE DATABASE {database};")
        print(f"   \\q")
        print()
        
        print("📝 Or use pgAdmin/DBeaver to create a database named: " + database)
        print()
        
        print("✅ After creating the database, run:")
        print("   python init_db.py")
    else:
        print("❌ Invalid DATABASE_URL format")
else:
    print("⚠️  DATABASE_URL is not PostgreSQL format")
    print("   Current:", DATABASE_URL)
    print()
    print("   Expected format:")
    print("   postgresql+asyncpg://username:password@host:port/database")
    print()
    print("   Example:")
    print("   postgresql+asyncpg://postgres:password@localhost:5432/skillbridge")
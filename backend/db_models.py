# import datetime
from datetime import datetime, timedelta
from sqlalchemy import Column, Integer, String, Text, JSON, DateTime, ForeignKey, Float
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.orm import relationship
import secrets


Base = declarative_base()

# ----------------------------
# User Table
# ----------------------------
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="user")  # user, admin, hr
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    interviews = relationship("Interview", back_populates="user")
    progress = relationship("UserProgress", back_populates="user")
    
    # In your User model (add this line)
    reset_tokens = relationship("PasswordResetToken", back_populates="user", cascade="all, delete")

# ----------------------------
# Interview Table
# ----------------------------
class Interview(Base):
    __tablename__ = "interviews"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Nullable for backward compatibility
    domain = Column(String(50))
    question = Column(Text)
    response = Column(Text)
    feedback = Column(JSON)
    audio_path = Column(String(500))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="interviews")

# ----------------------------
# User Progress Table
# ----------------------------
class UserProgress(Base):
    __tablename__ = "user_progress"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    domain = Column(String(50))
    total_sessions = Column(Integer, default=0)
    avg_clarity_score = Column(Float, default=0.0)
    avg_confidence_score = Column(Float, default=0.0)
    avg_grammar_score = Column(Float, default=0.0)
    avg_overall_score = Column(Float, default=0.0)
    last_practice_date = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="progress")

# ----------------------------
# Password Reset Token Table
# ----------------------------
class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    token = Column(String, unique=True, index=True)
    expires_at = Column(DateTime, default=lambda: datetime.utcnow() + timedelta(hours=1))

    user = relationship("User", back_populates="reset_tokens")
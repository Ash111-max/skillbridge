from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, List
from datetime import datetime

# =================== USER SCHEMAS ===================

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    name: str
    email: str
    role: str
    created_at: datetime

class TokenResponse(BaseModel):
    access_token: str
    user: UserResponse

# =================== INTERVIEW SCHEMAS ===================

class InterviewResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    user_id: Optional[int]
    domain: str
    question: str
    response: str
    feedback: dict
    created_at: datetime

class InterviewHistoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    domain: str
    question: str
    created_at: datetime
    overall_score: Optional[float] = None

# =================== PROGRESS SCHEMAS ===================

class DomainProgressResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    domain: str
    total_sessions: int
    avg_clarity_score: float
    avg_confidence_score: float
    avg_grammar_score: float
    avg_overall_score: float
    last_practice_date: datetime

# =================== DASHBOARD SCHEMAS ===================

class UserDashboardResponse(BaseModel):
    user: UserResponse
    total_interviews: int
    domains_practiced: int
    avg_overall_score: float
    recent_interviews: List[InterviewHistoryResponse]
    progress_by_domain: List[DomainProgressResponse]

# =================== PASSWORD RESET SCHEMAS ===================

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class PasswordResetResponse(BaseModel):
    message: str
    dev_token: Optional[str] = None

class TokenVerificationResponse(BaseModel):
    valid: bool
    email: str
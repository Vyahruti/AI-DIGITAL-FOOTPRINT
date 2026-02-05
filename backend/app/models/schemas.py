"""
Pydantic models for request/response validation
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from datetime import datetime
from enum import Enum


class RiskLevel(str, Enum):
    """Risk level enumeration"""
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class PIIEntity(BaseModel):
    """Detected PII entity"""
    type: str = Field(..., description="Entity type (PERSON, EMAIL, etc.)")
    text: str = Field(..., description="Actual text detected")
    start: int = Field(..., description="Start position in text")
    end: int = Field(..., description="End position in text")
    confidence: float = Field(default=1.0, description="Detection confidence (0-1)")


class AnalyzeTextRequest(BaseModel):
    """Request model for text analysis"""
    text: str = Field(..., min_length=10, max_length=10000, description="Text to analyze")
    user_id: Optional[str] = Field(default=None, description="Optional user ID")
    include_recommendations: bool = Field(default=True, description="Include LLM recommendations")
    include_rewrite: bool = Field(default=True, description="Include safe text rewrite")


class Features(BaseModel):
    """Extracted features for ML model"""
    num_emails: int = 0
    num_phones: int = 0
    num_locations: int = 0
    num_persons: int = 0
    num_organizations: int = 0
    num_dates: int = 0
    text_length: int = 0
    entity_density: float = 0.0
    sensitive_keywords_count: int = 0


class RiskScore(BaseModel):
    """Risk scoring details"""
    score: float = Field(..., ge=0, le=100, description="Risk score (0-100)")
    level: RiskLevel = Field(..., description="Risk category")
    ml_probability: float = Field(..., ge=0, le=1, description="ML model probability")
    confidence: float = Field(..., ge=0, le=1, description="Overall confidence")


class AnalysisResult(BaseModel):
    """Complete analysis result"""
    analysis_id: str = Field(..., description="Unique analysis ID")
    input_text: str = Field(..., description="Original input text")
    pii_entities: List[PIIEntity] = Field(default=[], description="Detected PII entities")
    features: Features = Field(..., description="Extracted features")
    risk_score: RiskScore = Field(..., description="Risk assessment")
    recommendations: List[str] = Field(default=[], description="Privacy recommendations")
    safe_rewrite: Optional[str] = Field(default=None, description="Privacy-safe version")
    processing_time: float = Field(..., description="Processing time in seconds")
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class HistoryItem(BaseModel):
    """History item summary"""
    analysis_id: str
    timestamp: datetime
    risk_level: RiskLevel
    risk_score: float
    num_entities: int
    text_preview: str = Field(..., description="First 100 chars")


class HistoryResponse(BaseModel):
    """User history response"""
    total: int
    items: List[HistoryItem]


class StatsResponse(BaseModel):
    """System statistics"""
    total_analyses: int
    analyses_by_risk: Dict[str, int]
    most_common_entities: Dict[str, int]
    average_risk_score: float
    average_processing_time: float


class ErrorResponse(BaseModel):
    """Error response model"""
    error: str
    detail: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

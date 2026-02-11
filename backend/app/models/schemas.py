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


class TrainingChallenge(BaseModel):
    """Privacy training challenge definition"""
    id: str = Field(..., description="Challenge identifier")
    prompt: str = Field(..., description="Instruction for the user")
    risky_text: str = Field(..., description="Original risky paragraph the user should improve")
    tips: List[str] = Field(default_factory=list, description="Hints for rewriting more safely")


class TrainingChallengeResponse(BaseModel):
    """Response model when fetching a training challenge"""
    challenge: TrainingChallenge


class TrainingAttemptRequest(BaseModel):
    """User submission for a training challenge"""
    challenge_id: str = Field(..., description="Challenge identifier")
    user_text: str = Field(..., min_length=10, max_length=10000, description="User's rewritten paragraph")


class TrainingScore(BaseModel):
    """Scoring breakdown for a training attempt"""
    total_score: float = Field(..., ge=0, le=100, description="Overall training score (0-100)")
    pii_reduction_score: float = Field(..., ge=0, le=100, description="Score for reducing PII")
    clarity_score: float = Field(..., ge=0, le=100, description="Score for preserving clarity and meaning")
    style_score: float = Field(..., ge=0, le=100, description="Score for natural, privacy-aware wording")
    feedback: List[str] = Field(default_factory=list, description="Textual feedback items")


class TrainingAttemptResponse(BaseModel):
    """Response after auto-scoring a training attempt"""
    challenge_id: str
    user_text: str
    original_text: str
    score: TrainingScore


class PrivacyChatRequest(BaseModel):
    """Request model for privacy chatbot assistant"""
    question: str = Field(..., min_length=5, max_length=1000, description="User's privacy-related question")
    locale: Optional[str] = Field(default="IN", description="User's legal/region context (e.g., IN, US, EU)")


class PrivacyChatResponse(BaseModel):
    """Response from privacy chatbot assistant"""
    answer: str = Field(..., description="Assistant response with legal + practical guidance")
    disclaimer: str = Field(..., description="Non-legal-advice disclaimer")


class AssistantChatRequest(BaseModel):
    """Request model for AI privacy assistant"""
    message: str = Field(..., min_length=1, max_length=2000, description="User's message")


class AssistantChatResponse(BaseModel):
    """Response from AI privacy assistant"""
    reply: str = Field(..., description="Assistant's response")


class ProfileSource(str, Enum):
    """Supported external profile types"""
    LINKEDIN = "LINKEDIN"
    X_TWITTER = "X_TWITTER"


class ProfileRiskRequest(BaseModel):
    """Request model for social profile risk analysis"""
    source: ProfileSource = Field(..., description="Platform: LinkedIn or X (Twitter)")
    identifier: str = Field(
        ...,
        description="Profile identifier (full LinkedIn URL or @username for X)",
    )
    include_recommendations: bool = Field(default=True)
    include_rewrite: bool = Field(default=True)


class ProfileRiskResponse(AnalysisResult):
    """Reuse AnalysisResult for profile risk, with optional metadata"""
    source: ProfileSource = Field(..., description="Platform analyzed")
    identifier: str = Field(..., description="Original profile handle/URL provided")


class LinkedInExposedPII(BaseModel):
    """Exposed PII found in LinkedIn profile"""
    type: str = Field(..., description="Type of PII (email, phone, address)")
    value: str = Field(..., description="Actual value found")
    location: str = Field(..., description="Where it was found (About section, etc.)")


class LinkedInPrivacyIssue(BaseModel):
    """Privacy issue detected in LinkedIn profile"""
    type: str = Field(..., description="Issue type")
    severity: str = Field(..., description="Severity level (low, medium, high)")
    message: str = Field(..., description="Description of the issue")


class LinkedInPrivacyScore(BaseModel):
    """Privacy risk score for LinkedIn profile"""
    score: int = Field(..., ge=0, le=100, description="Privacy risk score (0-100)")
    level: str = Field(..., description="Risk level (LOW RISK, MEDIUM RISK, HIGH RISK)")
    max_score: int = Field(default=100)


class LinkedInAnalyzeRequest(BaseModel):
    """Request model for LinkedIn profile analysis"""
    profile_url: str = Field(..., min_length=10, description="LinkedIn profile URL")
    include_recommendations: bool = Field(default=True, description="Include privacy recommendations")


class LinkedInAnalysisResult(BaseModel):
    """LinkedIn profile analysis result"""
    url: str = Field(..., description="LinkedIn profile URL")
    name: Optional[str] = Field(default=None, description="Profile name")
    headline: Optional[str] = Field(default=None, description="Profile headline")
    location: Optional[str] = Field(default=None, description="Location")
    about: Optional[str] = Field(default=None, description="About section text")
    profile_picture_url: Optional[str] = Field(default=None)
    exposed_pii: List[LinkedInExposedPII] = Field(default=[], description="Detected PII")
    privacy_issues: List[LinkedInPrivacyIssue] = Field(default=[], description="Privacy issues")
    public_visibility: Dict[str, bool] = Field(default={}, description="What's publicly visible")
    privacy_score: LinkedInPrivacyScore = Field(..., description="Overall privacy risk")
    recommendations: List[str] = Field(default=[], description="Privacy recommendations")
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class GitHubExposedSecret(BaseModel):
    """Exposed secret found in GitHub repos"""
    type: str = Field(..., description="Type of secret (api_key, password, etc.)")
    repo: str = Field(..., description="Repository name")
    file: str = Field(..., description="File where found")
    severity: str = Field(..., description="Severity level (critical, high, medium, low)")
    message: str = Field(..., description="Description of the finding")


class GitHubPrivacyIssue(BaseModel):
    """Privacy issue detected in GitHub profile"""
    type: str = Field(..., description="Issue type")
    severity: str = Field(..., description="Severity level (high, medium, low)")
    message: str = Field(..., description="Description of the issue")
    location: str = Field(..., description="Where found (Profile, commits, etc.)")


class GitHubPrivacyScore(BaseModel):
    """Privacy risk score for GitHub profile"""
    score: int = Field(..., ge=0, le=100, description="Privacy risk score (0-100)")
    level: str = Field(..., description="Risk level (LOW RISK, MEDIUM RISK, HIGH RISK)")
    max_score: int = Field(default=100)


class GitHubRepositoryInfo(BaseModel):
    """Repository information"""
    name: str
    description: Optional[str]
    private: bool
    has_issues: bool


class GitHubProfileInfo(BaseModel):
    """GitHub profile information"""
    name: Optional[str]
    bio: Optional[str]
    location: Optional[str]
    email: Optional[str]
    company: Optional[str]
    blog: Optional[str]
    twitter_username: Optional[str]
    public_repos: int
    followers: int
    created_at: Optional[str]


class GitHubAnalyzeRequest(BaseModel):
    """Request model for GitHub profile analysis"""
    username: str = Field(..., min_length=1, max_length=39, description="GitHub username")
    github_token: Optional[str] = Field(default=None, description="Optional GitHub token for higher rate limits")
    include_recommendations: bool = Field(default=True, description="Include privacy recommendations")


class GitHubAnalysisResult(BaseModel):
    """GitHub profile analysis result"""
    username: str = Field(..., description="GitHub username")
    profile: GitHubProfileInfo = Field(..., description="Profile information")
    repositories: List[GitHubRepositoryInfo] = Field(default=[], description="Repository list")
    exposed_secrets: List[GitHubExposedSecret] = Field(default=[], description="Exposed secrets")
    privacy_issues: List[GitHubPrivacyIssue] = Field(default=[], description="Privacy issues")
    commit_emails: List[str] = Field(default=[], description="Emails found in commits")
    privacy_score: GitHubPrivacyScore = Field(..., description="Overall privacy risk")
    recommendations: List[str] = Field(default=[], description="Privacy recommendations")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    recommendations: List[str] = Field(default=[], description="Privacy recommendations")
    timestamp: datetime = Field(default_factory=datetime.utcnow)


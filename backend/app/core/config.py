"""
Configuration settings for the application
Uses pydantic-settings for environment variable management
"""

from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    """Application settings"""
    
    # Project Info
    PROJECT_NAME: str = "AI Privacy Footprint Analyzer"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "Hybrid AI system for privacy risk detection"
    API_V1_STR: str = "/api"
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-this-in-production-min-32-chars"
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True
    
    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:5173"
    ]
    
    # MongoDB (optional - will use in-memory storage if not configured)
    MONGODB_URL: str = ""
    MONGODB_DB_NAME: str = "privacy_analyzer"
    
    # OpenAI API (for LLM)
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-3.5-turbo"
    OPENAI_TEMPERATURE: float = 0.7
    OPENAI_MAX_TOKENS: int = 500

    # Gemini API (for privacy assistant)
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-1.5-flash-latest"
    
    # GitHub API (for profile scanning)
    GITHUB_TOKEN: str = ""
    
    # LangChain
    LANGCHAIN_TRACING_V2: bool = False
    LANGCHAIN_API_KEY: str = ""
    
    # NLP Models
    SPACY_MODEL: str = "en_core_web_sm"  # Using smaller model for faster setup
    
    # ML Model Paths
    ML_MODEL_PATH: str = "./app/ml/models/risk_classifier.pkl"
    ML_VECTORIZER_PATH: str = "./app/ml/models/vectorizer.pkl"
    
    # Risk Thresholds
    RISK_LOW_THRESHOLD: float = 0.3
    RISK_MEDIUM_THRESHOLD: float = 0.6
    RISK_HIGH_THRESHOLD: float = 0.6
    
    # Feature Weights (for ML)
    FEATURE_WEIGHTS: dict = {
        "num_emails": 0.15,
        "num_phones": 0.15,
        "num_locations": 0.10,
        "num_persons": 0.12,
        "num_organizations": 0.08,
        "text_length": 0.05,
        "entity_density": 0.20,
        "sensitive_keywords": 0.15
    }
    
    # PII Entity Types
    PII_ENTITIES: List[str] = [
        "PERSON",
        "EMAIL_ADDRESS", 
        "PHONE_NUMBER",
        "LOCATION",
        "GPE",  # Geo-Political Entity
        "DATE",
        "ORGANIZATION",
        "IP_ADDRESS",
        "CREDIT_CARD",
        "IBAN_CODE",
        "US_SSN",
        "MEDICAL_LICENSE",
        "URL"
    ]
    
    # Sensitive Keywords (for context)
    SENSITIVE_KEYWORDS: List[str] = [
        "password", "ssn", "social security", "credit card",
        "bank account", "routing number", "passport",
        "license", "medical", "diagnosis", "therapy",
        "salary", "income", "address", "home", "live at"
    ]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Create global settings instance
settings = Settings()

# --- Debug: Print loaded API keys ---
print("--- Loading .env settings ---")
print(f"OpenAI Key loaded: {'Yes' if settings.OPENAI_API_KEY else 'No'}")
print(f"Gemini Key loaded: {'Yes' if settings.GEMINI_API_KEY else 'No'}")
print("-----------------------------")

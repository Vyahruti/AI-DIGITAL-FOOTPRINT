"""
Machine Learning Service - Risk Scoring
Uses scikit-learn for risk classification
"""

import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from typing import Tuple, Dict
import os

from app.models.schemas import Features, RiskScore, RiskLevel
from app.core.config import settings


class MLService:
    """Machine Learning service for risk scoring"""
    
    def __init__(self):
        self.model = None
        self.scaler = None
        self.model_type = "rule_based"  # Start with rule-based, upgrade to ML
        self._initialize()
    
    def _initialize(self):
        """Initialize or load ML model"""
        model_path = settings.ML_MODEL_PATH
        
        # Try to load pre-trained model
        if os.path.exists(model_path):
            try:
                self.model = joblib.load(model_path)
                self.scaler = joblib.load(settings.ML_VECTORIZER_PATH)
                self.model_type = "trained"
                print(f"✅ Loaded trained ML model from {model_path}")
            except Exception as e:
                print(f"⚠️  Could not load model: {e}")
                self._initialize_default_model()
        else:
            print("ℹ️  No trained model found. Using rule-based scoring.")
            print("   Train a model later with: python scripts/train_model.py")
            self._initialize_default_model()
    
    def _initialize_default_model(self):
        """Initialize a simple rule-based model"""
        # We'll use rule-based scoring until a model is trained
        self.model = None
        self.scaler = StandardScaler()
        self.model_type = "rule_based"
    
    def extract_features(self, text: str, entity_counts: Dict[str, int], 
                        sensitive_keywords: int) -> Features:
        """
        Extract features from text for ML model
        
        Args:
            text: Input text
            entity_counts: Dictionary of entity counts
            sensitive_keywords: Count of sensitive keywords
            
        Returns:
            Features object
        """
        text_length = len(text)
        total_entities = sum(entity_counts.values())
        entity_density = total_entities / text_length if text_length > 0 else 0
        
        return Features(
            num_emails=entity_counts.get("num_emails", 0),
            num_phones=entity_counts.get("num_phones", 0),
            num_locations=entity_counts.get("num_locations", 0),
            num_persons=entity_counts.get("num_persons", 0),
            num_organizations=entity_counts.get("num_organizations", 0),
            num_dates=entity_counts.get("num_dates", 0),
            text_length=text_length,
            entity_density=entity_density,
            sensitive_keywords_count=sensitive_keywords
        )
    
    def calculate_risk_score(self, features: Features) -> RiskScore:
        """
        Calculate risk score from features
        
        Args:
            features: Extracted features
            
        Returns:
            RiskScore object with score and level
        """
        if self.model and self.model_type == "trained":
            # Use trained ML model
            return self._ml_based_scoring(features)
        else:
            # Use rule-based scoring
            return self._rule_based_scoring(features)
    
    def _rule_based_scoring(self, features: Features) -> RiskScore:
        """
        Rule-based risk scoring (baseline)
        
        Uses weighted feature importance
        """
        weights = settings.FEATURE_WEIGHTS
        
        # Normalize features
        normalized_features = {
            "num_emails": min(features.num_emails / 3, 1.0),
            "num_phones": min(features.num_phones / 2, 1.0),
            "num_locations": min(features.num_locations / 5, 1.0),
            "num_persons": min(features.num_persons / 3, 1.0),
            "num_organizations": min(features.num_organizations / 3, 1.0),
            "text_length": min(features.text_length / 1000, 1.0),
            "entity_density": min(features.entity_density * 100, 1.0),
            "sensitive_keywords": min(features.sensitive_keywords_count / 5, 1.0)
        }
        
        # Calculate weighted score
        score = 0.0
        for feature, value in normalized_features.items():
            weight = weights.get(feature, 0.1)
            score += value * weight
        
        # Convert to 0-100 scale
        score_100 = min(score * 100, 100)
        
        # Determine risk level
        if score < settings.RISK_LOW_THRESHOLD:
            level = RiskLevel.LOW
        elif score < settings.RISK_MEDIUM_THRESHOLD:
            level = RiskLevel.MEDIUM
        else:
            level = RiskLevel.HIGH
        
        return RiskScore(
            score=round(score_100, 2),
            level=level,
            ml_probability=score,
            confidence=0.75  # Rule-based has moderate confidence
        )
    
    def _ml_based_scoring(self, features: Features) -> RiskScore:
        """
        ML model-based risk scoring (advanced)
        
        Uses trained Random Forest or Logistic Regression
        """
        # Convert features to array
        feature_array = np.array([[
            features.num_emails,
            features.num_phones,
            features.num_locations,
            features.num_persons,
            features.num_organizations,
            features.num_dates,
            features.text_length,
            features.entity_density,
            features.sensitive_keywords_count
        ]])
        
        # Scale features
        if self.scaler:
            feature_array = self.scaler.transform(feature_array)
        
        # Predict
        prediction = self.model.predict(feature_array)[0]
        probabilities = self.model.predict_proba(feature_array)[0]
        
        # Map prediction to risk level
        risk_levels = [RiskLevel.LOW, RiskLevel.MEDIUM, RiskLevel.HIGH]
        level = risk_levels[prediction]
        
        # Get probability of predicted class
        ml_probability = probabilities[prediction]
        
        # Calculate overall score (weighted average of probabilities)
        score_100 = (probabilities[0] * 25 + probabilities[1] * 60 + probabilities[2] * 100)
        
        return RiskScore(
            score=round(score_100, 2),
            level=level,
            ml_probability=ml_probability,
            confidence=ml_probability  # Use model confidence
        )
    
    def get_feature_importance(self) -> Dict[str, float]:
        """Get feature importance from trained model"""
        if self.model and hasattr(self.model, 'feature_importances_'):
            feature_names = [
                "num_emails", "num_phones", "num_locations", 
                "num_persons", "num_organizations", "num_dates",
                "text_length", "entity_density", "sensitive_keywords"
            ]
            return dict(zip(feature_names, self.model.feature_importances_))
        return settings.FEATURE_WEIGHTS


# Global ML service instance
ml_service = MLService()

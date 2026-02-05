"""
NLP Service - PII Detection using spaCy and Presidio
"""

import spacy
from presidio_analyzer import AnalyzerEngine, RecognizerRegistry
from presidio_analyzer.nlp_engine import NlpEngineProvider
from typing import List, Dict
from app.models.schemas import PIIEntity
from app.core.config import settings


class NLPService:
    """NLP service for PII detection"""
    
    def __init__(self):
        self.nlp = None
        self.analyzer = None
        self._initialize()
    
    def _initialize(self):
        """Initialize spaCy and Presidio"""
        try:
            # Load spaCy model
            self.nlp = spacy.load(settings.SPACY_MODEL)
            print(f"✅ Loaded spaCy model: {settings.SPACY_MODEL}")
        except OSError:
            print(f"⚠️  spaCy model not found. Download it with:")
            print(f"   python -m spacy download {settings.SPACY_MODEL}")
            # Fallback to smaller model
            try:
                self.nlp = spacy.load("en_core_web_sm")
                print("✅ Loaded fallback model: en_core_web_sm")
            except:
                print("❌ No spaCy model available. Install with:")
                print("   python -m spacy download en_core_web_sm")
                self.nlp = None
        
        # Initialize Presidio Analyzer
        try:
            configuration = {
                "nlp_engine_name": "spacy",
                "models": [{"lang_code": "en", "model_name": settings.SPACY_MODEL}]
            }
            
            provider = NlpEngineProvider(nlp_configuration=configuration)
            nlp_engine = provider.create_engine()
            
            self.analyzer = AnalyzerEngine(nlp_engine=nlp_engine)
            print("✅ Presidio Analyzer initialized")
        except Exception as e:
            print(f"⚠️  Presidio initialization warning: {e}")
            self.analyzer = AnalyzerEngine()
    
    def detect_pii(self, text: str) -> List[PIIEntity]:
        """
        Detect PII entities in text using both spaCy and Presidio
        
        Args:
            text: Input text to analyze
            
        Returns:
            List of detected PII entities
        """
        entities = []
        seen_spans = set()  # To avoid duplicates
        
        # Method 1: Presidio Analysis (primary)
        if self.analyzer:
            results = self.analyzer.analyze(
                text=text,
                language="en",
                entities=settings.PII_ENTITIES
            )
            
            for result in results:
                span = (result.start, result.end)
                if span not in seen_spans:
                    entities.append(PIIEntity(
                        type=result.entity_type,
                        text=text[result.start:result.end],
                        start=result.start,
                        end=result.end,
                        confidence=result.score
                    ))
                    seen_spans.add(span)
        
        # Method 2: spaCy NER (supplementary)
        if self.nlp:
            doc = self.nlp(text)
            for ent in doc.ents:
                span = (ent.start_char, ent.end_char)
                if span not in seen_spans and ent.label_ in ["PERSON", "GPE", "LOC", "ORG", "DATE"]:
                    entities.append(PIIEntity(
                        type=ent.label_,
                        text=ent.text,
                        start=ent.start_char,
                        end=ent.end_char,
                        confidence=0.85  # Default confidence for spaCy
                    ))
                    seen_spans.add(span)
        
        # Sort by position
        entities.sort(key=lambda x: x.start)
        
        return entities
    
    def extract_entity_counts(self, entities: List[PIIEntity]) -> Dict[str, int]:
        """
        Count entities by type
        
        Args:
            entities: List of detected entities
            
        Returns:
            Dictionary with entity counts
        """
        counts = {
            "num_emails": 0,
            "num_phones": 0,
            "num_locations": 0,
            "num_persons": 0,
            "num_organizations": 0,
            "num_dates": 0,
            "num_other": 0
        }
        
        for entity in entities:
            entity_type = entity.type.upper()
            
            if "EMAIL" in entity_type:
                counts["num_emails"] += 1
            elif "PHONE" in entity_type:
                counts["num_phones"] += 1
            elif entity_type in ["LOCATION", "GPE", "LOC"]:
                counts["num_locations"] += 1
            elif entity_type == "PERSON":
                counts["num_persons"] += 1
            elif entity_type in ["ORGANIZATION", "ORG"]:
                counts["num_organizations"] += 1
            elif entity_type == "DATE":
                counts["num_dates"] += 1
            else:
                counts["num_other"] += 1
        
        return counts
    
    def detect_sensitive_keywords(self, text: str) -> int:
        """
        Count sensitive keywords in text
        
        Args:
            text: Input text
            
        Returns:
            Count of sensitive keywords found
        """
        text_lower = text.lower()
        count = sum(1 for keyword in settings.SENSITIVE_KEYWORDS if keyword in text_lower)
        return count


# Global NLP service instance
nlp_service = NLPService()

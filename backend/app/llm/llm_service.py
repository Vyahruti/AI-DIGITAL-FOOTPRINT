"""
LLM Service - AI Recommendations using LangChain
"""

from typing import List, Optional
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import HumanMessage, SystemMessage
from app.core.config import settings
from app.models.schemas import PIIEntity, RiskLevel


class LLMService:
    """LLM service for AI-powered recommendations and text rewriting"""
    
    def __init__(self):
        self.llm = None
        self.enabled = False
        self._initialize()
    
    def _initialize(self):
        """Initialize OpenAI LLM"""
        if settings.OPENAI_API_KEY and settings.OPENAI_API_KEY != "":
            try:
                self.llm = ChatOpenAI(
                    model=settings.OPENAI_MODEL,
                    temperature=settings.OPENAI_TEMPERATURE,
                    max_tokens=settings.OPENAI_MAX_TOKENS,
                    openai_api_key=settings.OPENAI_API_KEY
                )
                self.enabled = True
                print(f"✅ LLM initialized: {settings.OPENAI_MODEL}")
            except Exception as e:
                print(f"⚠️  LLM initialization failed: {e}")
                self.enabled = False
        else:
            print("ℹ️  OpenAI API key not set. LLM features disabled.")
            print("   Set OPENAI_API_KEY in .env to enable recommendations.")
            self.enabled = False
    
    def generate_recommendations(
        self, 
        text: str, 
        pii_entities: List[PIIEntity],
        risk_level: RiskLevel
    ) -> List[str]:
        """
        Generate privacy recommendations using LLM
        
        Args:
            text: Original text
            pii_entities: Detected PII entities
            risk_level: Calculated risk level
            
        Returns:
            List of recommendations
        """
        if not self.enabled:
            return self._fallback_recommendations(pii_entities, risk_level)
        
        try:
            # Build entity summary
            entity_summary = self._build_entity_summary(pii_entities)
            
            # Create prompt
            system_prompt = """You are a privacy expert AI assistant. 
Analyze the detected PII (Personal Identifiable Information) and provide 
specific, actionable privacy recommendations. Be concise and practical."""
            
            user_prompt = f"""
Text Risk Level: {risk_level.value}

Detected PII:
{entity_summary}

Original Text:
{text[:500]}...

Provide 3-5 specific privacy recommendations to reduce risk.
Focus on what information to remove or generalize.
"""
            
            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt)
            ]
            
            response = self.llm(messages)
            
            # Parse recommendations (assuming numbered list)
            recommendations = self._parse_recommendations(response.content)
            
            return recommendations
            
        except Exception as e:
            print(f"⚠️  LLM recommendation error: {e}")
            return self._fallback_recommendations(pii_entities, risk_level)
    
    def rewrite_text_safely(
        self, 
        text: str, 
        pii_entities: List[PIIEntity]
    ) -> Optional[str]:
        """
        Rewrite text with privacy-safe alternatives
        
        Args:
            text: Original text
            pii_entities: Detected PII entities
            
        Returns:
            Privacy-safe version of text
        """
        if not self.enabled:
            return self._fallback_rewrite(text, pii_entities)
        
        try:
            entity_summary = self._build_entity_summary(pii_entities)
            
            system_prompt = """You are a privacy expert. Rewrite the given text to remove 
all PII while maintaining the FULL context, details, and natural tone. 

CRITICAL RULES:
- PRESERVE the original message's length and detail level
- KEEP all non-sensitive information (purpose, context, relationships, topics)
- Replace names with generic but contextual descriptions ("a colleague from the medical field", "someone from Springfield")
- Replace emails/phones with platform-agnostic contact methods ("through this platform's messaging", "via the contact form")
- Replace exact addresses with general but useful areas ("in the New York metro area", "in the downtown district")
- Replace exact dates with approximate but contextual timeframes ("born in the early 90s", "around May", "this coming weekend")
- Replace SSN/credit cards/IDs with generic placeholders ("my identification number", "payment information on file")
- Replace specific locations with public alternatives ("at a local coffee shop" instead of "at my place")
- MAINTAIN all paragraphs, structure, and formatting from the original
- Keep the friendly, conversational tone
- Make it sound natural and complete, NOT overly shortened
- DO NOT use [REDACTED] or brackets
- The rewrite should be roughly the same length as the original

Return ONLY the rewritten text with FULL context preserved."""
            
            user_prompt = f"""
Detected PII to remove/generalize:
{entity_summary}

Original Text:
{text}

Rewrite this as a natural, privacy-safe alternative:
"""
            
            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt)
            ]
            
            response = self.llm(messages)
            
            return response.content.strip()
            
        except Exception as e:
            print(f"⚠️  LLM rewrite error: {e}")
            return self._fallback_rewrite(text, pii_entities)
    
    def _build_entity_summary(self, entities: List[PIIEntity]) -> str:
        """Build a summary of detected entities"""
        if not entities:
            return "No PII detected"
        
        entity_groups = {}
        for entity in entities:
            entity_type = entity.type
            if entity_type not in entity_groups:
                entity_groups[entity_type] = []
            entity_groups[entity_type].append(entity.text)
        
        summary_lines = []
        for entity_type, texts in entity_groups.items():
            summary_lines.append(f"- {entity_type}: {', '.join(texts[:3])}")
        
        return "\n".join(summary_lines)
    
    def _parse_recommendations(self, llm_response: str) -> List[str]:
        """Parse LLM response into list of recommendations"""
        lines = llm_response.strip().split('\n')
        recommendations = []
        
        for line in lines:
            line = line.strip()
            if line and (line[0].isdigit() or line.startswith('-') or line.startswith('•')):
                # Remove numbering/bullets
                clean_line = line.lstrip('0123456789.-•) ').strip()
                if clean_line:
                    recommendations.append(clean_line)
        
        return recommendations[:5]  # Max 5 recommendations
    
    def _fallback_recommendations(
        self, 
        pii_entities: List[PIIEntity],
        risk_level: RiskLevel
    ) -> List[str]:
        """Fallback recommendations when LLM is unavailable"""
        recommendations = []
        
        entity_types = {e.type for e in pii_entities}
        
        if "EMAIL_ADDRESS" in entity_types or "PHONE_NUMBER" in entity_types:
            recommendations.append(
                "Remove or hide direct contact information. Use platform messaging instead."
            )
        
        if "PERSON" in entity_types:
            recommendations.append(
                "Avoid using full real names. Use initials or usernames instead."
            )
        
        if "LOCATION" in entity_types or "GPE" in entity_types:
            recommendations.append(
                "Replace specific locations with general areas (e.g., 'New York' instead of full address)."
            )
        
        if "DATE" in entity_types:
            recommendations.append(
                "Generalize specific dates to protect timing information."
            )
        
        if risk_level == RiskLevel.HIGH:
            recommendations.append(
                "⚠️ HIGH RISK: Consider not sharing this information publicly at all."
            )
        
        if not recommendations:
            recommendations.append("Your text appears relatively safe. Continue being mindful of personal details.")
        
        return recommendations
    
    def _fallback_rewrite(
        self, 
        text: str, 
        pii_entities: List[PIIEntity]
    ) -> str:
        """Smart fallback text rewriting with detailed context preservation"""
        import re
        
        # Analyze the original text structure
        entity_types = {e.type for e in pii_entities}
        lines = text.split('\n')
        has_subject = text.lower().startswith('subject:')
        
        # Build a comprehensive rewrite maintaining structure
        rewrite_parts = []
        
        # Preserve subject line if present
        if has_subject:
            rewrite_parts.append("Subject: Account Recovery Request - Urgent\n")
        
        # Main greeting with context
        if "PERSON" in entity_types:
            if "medical" in text.lower() or "hospital" in text.lower():
                rewrite_parts.append("Hi, I'm a healthcare professional from a medical organization in the area.")
            elif "company" in text.lower() or "work" in text.lower():
                rewrite_parts.append("Hi, I'm a professional from an organization.")
            else:
                rewrite_parts.append("Hi, I'm interested in connecting with you.")
        else:
            rewrite_parts.append("Hello there!")
        
        # Account/purpose context
        if "recover" in text.lower() or "account" in text.lower():
            rewrite_parts.append("I need to recover my account as soon as possible.")
        
        # Personal details section (if SSN, DOB, etc. present)
        if "SSN" in entity_types or "US_SSN" in entity_types or "DATE" in entity_types:
            rewrite_parts.append("\nPersonal Details:")
            
            if "DATE" in entity_types:
                year_match = re.search(r'19\d{2}|20\d{2}', text)
                if year_match:
                    year = int(year_match.group())
                    decade = (year // 10) * 10
                    rewrite_parts.append(f"I was born in the early {decade}s generation, around the spring/summer timeframe.")
            
            if "SSN" in entity_types or "US_SSN" in entity_types:
                rewrite_parts.append("My identification number and verification details are on file with your system.")
            
            if "maiden" in text.lower():
                rewrite_parts.append("Security verification information is available in your records.")
        
        # Contact information section
        if "EMAIL_ADDRESS" in entity_types or "PHONE_NUMBER" in entity_types:
            rewrite_parts.append("\nContact Information:")
            rewrite_parts.append("You can reach me through this platform's messaging system or via the contact methods on file.")
            
            if text.count("@") >= 2:  # Multiple emails
                rewrite_parts.append("I have both personal and professional contact channels available.")
        
        # Address/location section
        if "LOCATION" in entity_types or "GPE" in entity_types:
            location_context = []
            if re.search(r'New York|NYC', text, re.IGNORECASE):
                location_context.append("I'm located in the New York metropolitan area")
            elif re.search(r'\d+\s+\w+\s+(Street|Avenue|Road|Blvd)', text, re.IGNORECASE):
                location_context.append("I'm in a residential area in the city")
            
            if "apartment" in text.lower() or "apt" in text.lower():
                location_context.append("in an apartment complex")
            
            if location_context:
                rewrite_parts.append("\nLocation: " + ", ".join(location_context) + ".")
        
        # Financial section
        if "CREDIT_CARD" in entity_types or "credit card" in text.lower() or "bank" in text.lower():
            rewrite_parts.append("\nFinancial Information:")
            rewrite_parts.append("My payment information and financial details are securely stored in your system.")
            
            if "salary" in text.lower():
                rewrite_parts.append("Employment and compensation details are on record.")
        
        # Medical section
        if "patient" in text.lower() or "insurance" in text.lower() or "prescription" in text.lower():
            rewrite_parts.append("\nMedical Information:")
            rewrite_parts.append("My patient ID and insurance policy information are available in the healthcare system.")
            rewrite_parts.append("Prescription and medical history details are documented.")
        
        # Employment section
        if "employee" in text.lower() or "manager" in text.lower():
            rewrite_parts.append("\nEmployment:")
            if "medical" in text.lower() or "hospital" in text.lower():
                rewrite_parts.append("I work in the healthcare sector, reporting to a supervisor in the medical department.")
            else:
                rewrite_parts.append("I'm employed at an organization with management oversight.")
            rewrite_parts.append("My employee information and credentials are in the HR system.")
        
        # Closing/availability
        if "weekend" in text.lower() or "available" in text.lower():
            if "my place" in text.lower() or "my home" in text.lower():
                rewrite_parts.append("\nI'll be available at a local public location this coming weekend.")
            else:
                rewrite_parts.append("\nI'm available for communication in the near future.")
        
        # Final contact reminder
        if "EMAIL_ADDRESS" in entity_types or "PHONE_NUMBER" in entity_types:
            rewrite_parts.append("Please use the secure messaging system or contact options available through the platform. Thanks!")
        
        # Combine all parts
        full_rewrite = " ".join(rewrite_parts)
        
        # Fallback if nothing was generated
        if len(full_rewrite) < 50:
            return "I'd like to connect regarding my account. Please reach me through the platform's secure messaging system for verification. I'm available for communication and can provide additional details through proper channels. Thank you for your assistance!"
        
        return full_rewrite


# Global LLM service instance
llm_service = LLMService()

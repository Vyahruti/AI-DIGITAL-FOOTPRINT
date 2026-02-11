"""LLM Service - AI Recommendations using LangChain & Gemini.

OpenAI (via LangChain) is used for analysis-related recommendations/rewrites.
Gemini is preferred for the privacy assistant chatbot answers.
"""

from typing import List, Optional

from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage

from app.core.config import settings
from app.models.schemas import PIIEntity, RiskLevel

try:  # Gemini is optional but preferred for the assistant
    import google.generativeai as genai
except ImportError:  # pragma: no cover - handled via feature flag
    genai = None


class LLMService:
    """LLM service for AI-powered recommendations and text rewriting"""
    
    def __init__(self):
        self.llm = None
        self.enabled = False
    
    def init_llm(self):
        """Initialize OpenAI and Gemini LLMs"""
        
        # This method is now called explicitly during app startup
        # to ensure .env is loaded first.
        
        # --- Gemini Initialization ---
        gemini_key = settings.GEMINI_API_KEY
        if genai and gemini_key:
            try:
                genai.configure(api_key=gemini_key)
                genai.get_model(settings.GEMINI_MODEL)
                print("✅ Gemini initialized successfully.")
                self.enabled = True
            except Exception as e:
                print(f"⚠️  Gemini initialization failed: {e}")
                print("   This could be due to an invalid API key or network issues.")
        else:
            print("ℹ️  Gemini API key not found in .env file. Gemini features disabled.")

        # --- OpenAI Initialization ---
        openai_key = settings.OPENAI_API_KEY
        if openai_key:
            try:
                self.llm = ChatOpenAI(
                    model=settings.OPENAI_MODEL,
                    temperature=settings.OPENAI_TEMPERATURE,
                    max_tokens=settings.OPENAI_MAX_TOKENS,
                    openai_api_key=openai_key
                )
                print(f"✅ OpenAI LLM initialized: {settings.OPENAI_MODEL}")
                self.enabled = True
            except Exception as e:
                print(f"⚠️  OpenAI LLM initialization failed: {e}")
                print("   This could be due to an invalid API key or network issues.")
        else:
            print("ℹ️  OpenAI API key not found in .env file. OpenAI features disabled.")

        if not self.enabled:
            print("\n🔴 CRITICAL: No valid LLM service is configured. The AI assistant will not work.")
            print("   Please provide a valid API key for either Gemini or OpenAI in the .env file.\n")
    
    
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
        # 1) Try Gemini first (if configured)
        if genai is not None and settings.GEMINI_API_KEY:
            try:
                genai.configure(api_key=settings.GEMINI_API_KEY)
                model_name = getattr(settings, "GEMINI_MODEL", "gemini-1.5-flash")
                model = genai.GenerativeModel(model_name)

                entity_summary = self._build_entity_summary(pii_entities)

                prompt = (
                    "You are a senior privacy engineer helping a user reduce risk in a piece of text.\n"
                    f"Risk level: {risk_level.value}.\n\n"
                    "Detected PII (types and examples):\n"
                    f"{entity_summary}\n\n"
                    "Original text (truncated for context):\n"
                    f"{text[:800]}\n\n"
                    "Give 3-6 highly concrete, numbered privacy recommendations. Each line should say exactly "
                    "what to redact, generalize, or move to a safer channel (e.g., 'Remove the exact home address "
                    "and just say you live in the city')."
                )

                response = model.generate_content(prompt)
                raw = (response.text or "").strip()
                if raw:
                    return self._parse_recommendations(raw)
            except Exception as e:  # pragma: no cover - external call
                print(f"⚠️  Gemini recommendation error: {e}")

        # 2) Fall back to OpenAI (LangChain) if enabled
        if self.enabled and self.llm is not None:
            try:
                entity_summary = self._build_entity_summary(pii_entities)

                system_prompt = """You are a privacy expert AI assistant. \
Analyze the detected PII (Personal Identifiable Information) and provide \
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
                recommendations = self._parse_recommendations(response.content)
                return recommendations
            except Exception as e:  # pragma: no cover - external call
                print(f"⚠️  OpenAI recommendation error: {e}")

        # 3) Final fallback
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
        entity_summary = self._build_entity_summary(pii_entities)

        # 1) Try Gemini first
        if genai is not None and settings.GEMINI_API_KEY:
            try:
                genai.configure(api_key=settings.GEMINI_API_KEY)
                model_name = getattr(settings, "GEMINI_MODEL", "gemini-1.5-flash")
                model = genai.GenerativeModel(model_name)

                prompt = (
                    "You are a privacy-focused rewriting assistant. Rewrite the text to remove or generalize "
                    "all personal identifiers (names, exact locations, contact details, IDs, dates, work details) "
                    "while keeping the message natural, complete, and roughly the same length.\n\n"
                    "Detected PII (types and examples):\n"
                    f"{entity_summary}\n\n"
                    "Original text:\n"
                    f"{text}\n\n"
                    "Return ONLY the rewritten text, with: (1) context preserved, (2) no [REDACTED] markers, and (3) "
                    "generic but meaningful replacements (e.g., 'a colleague from my previous job', 'a city in southern India')."
                )

                response = model.generate_content(prompt)
                rewritten = (response.text or "").strip()
                if rewritten:
                    return rewritten
            except Exception as e:  # pragma: no cover - external
                print(f"⚠️  Gemini rewrite error: {e}")

        # 2) Fallback to OpenAI (LangChain)
        if self.enabled and self.llm is not None:
            try:
                system_prompt = """You are a privacy expert. Rewrite the given text to remove \
all PII while maintaining the FULL context, details, and natural tone. \
\n+CRITICAL RULES:\
- PRESERVE the original message's length and detail level\
- KEEP all non-sensitive information (purpose, context, relationships, topics)\\
- Replace names with generic but contextual descriptions ("a colleague from the medical field", "someone from Springfield")\
- Replace emails/phones with platform-agnostic contact methods ("through this platform's messaging", "via the contact form")\
- Replace exact addresses with general but useful areas ("in the New York metro area", "in the downtown district")\
- Replace exact dates with approximate but contextual timeframes ("born in the early 90s", "around May", "this coming weekend")\
- Replace SSN/credit cards/IDs with generic placeholders ("my identification number", "payment information on file")\
- Replace specific locations with public alternatives ("at a local coffee shop" instead of "at my place")\
- MAINTAIN all paragraphs, structure, and formatting from the original\
- Keep the friendly, conversational tone\
- Make it sound natural and complete, NOT overly shortened\
- DO NOT use [REDACTED] or brackets\
- The rewrite should be roughly the same length as the original\
\
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
            except Exception as e:  # pragma: no cover - external
                print(f"⚠️  OpenAI rewrite error: {e}")

        # 3) Final fallback
        return self._fallback_rewrite(text, pii_entities)

    def answer_privacy_question(self, question: str, locale: str = "IN") -> str:
        """Answer a privacy question, preferring Gemini for richer guidance.

        The assistant should give practical, human-friendly guidance about
        digital privacy, with light jurisdiction-aware hints, but clearly
        state that it is not a lawyer and this is not legal advice.
        """

        disclaimer = (
            "This is general educational information, not legal advice. "
            "For decisions that could have serious consequences, consult a qualified professional."
        )

        if not self.enabled:
            return (
                "The AI assistant feature is currently disabled because an API key "
                "has not been configured. Please set either OPENAI_API_KEY or "
                "GEMINI_API_KEY in your .env file to enable this feature."
            )

        # This check is crucial. If initialization failed, self.llm is None.
        if not self.llm and not (genai and settings.GEMINI_API_KEY):
             return (
                "The AI assistant is not available. No LLM has been configured or "
                "the initialization failed. Check your API keys and server logs."
            )

        # 1) Try Gemini first (if configured)
        if genai is not None and settings.GEMINI_API_KEY:
            try:
                genai.configure(api_key=settings.GEMINI_API_KEY)
                model_name = getattr(settings, "GEMINI_MODEL", "gemini-1.5-flash")
                model = genai.GenerativeModel(model_name)

                system_instructions = (
                    "You are a friendly digital privacy coach for everyday users. "
                    "Explain risks in clear, simple language and give 3-5 very concrete, "
                    "actionable steps. Use examples that feel practical (chat apps, social media, "
                    "job portals, fintech apps, etc.). Do NOT be vague.\n\n"
                    "Base your answer on widely-accepted privacy best practices and, where relevant, "
                    "common principles from privacy regulations (like GDPR or Indian data protection rules), "
                    "but DO NOT claim to be a lawyer and DO NOT give formal legal advice."
                )

                prompt = (
                    f"Region or context: {locale}.\n"
                    f"User question: {question}\n\n"
                    "Structure your answer as: (1) short risk summary, (2) concrete things to avoid, "
                    "(3) safer alternatives and habits, written in 2-5 short paragraphs."
                )

                response = model.generate_content([system_instructions, prompt])
                text = (response.text or "").strip()

                if not text:
                    raise ValueError("Empty response from Gemini")

                if "This is not legal advice" not in text:
                    text = text + "\n\nThis is not legal advice."
                return text
            except Exception as e:  # pragma: no cover - network/external
                print(f"⚠️  Gemini privacy assistant error: {e}")

        # 2) Fallback to existing OpenAI-based assistant (if enabled)
        if self.enabled and self.llm is not None:
            try:
                system_prompt = (
                    "You are a friendly digital privacy coach for everyday users. "
                    "Explain risks in clear, simple language and give 2-4 practical steps the user can take. "
                    "Base your answer on widely-accepted privacy best practices and, where relevant, common "
                    "principles from privacy regulations (like GDPR or Indian data protection rules), but "
                    "DO NOT claim to be a lawyer and DO NOT give formal legal advice. Always include at the "
                    "end: 'This is not legal advice.'"
                )

                user_prompt = (
                    f"User region/context (rough): {locale}.\n"
                    f"User question: {question}\n\n"
                    "Answer in 2-5 short paragraphs, focusing on: (1) what the risks are, "
                    "(2) what to avoid sharing, and (3) safer alternatives."
                )

                messages = [
                    SystemMessage(content=system_prompt),
                    HumanMessage(content=user_prompt),
                ]
                response = self.llm(messages)
                text = response.content.strip()

                if "This is not legal advice" not in text:
                    text = text + "\n\nThis is not legal advice."
                return text
            except Exception as e:  # pragma: no cover - network/external
                print(f"⚠️  OpenAI privacy chatbot error: {e}")

        # 3) Final conservative fallback (no external LLM)
        return (
            "In general, be careful with sharing government IDs (like Aadhaar), "
            "live or precise locations, work IDs, and financial details on chat apps or social media. "
            "Prefer official apps or websites with two-factor authentication for sensitive actions, "
            "and review privacy settings on each platform you use.\n\nThis is not legal advice.\n" 
            + disclaimer
        )
    
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

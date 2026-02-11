"""
API Routes - Analysis Endpoints
"""

from fastapi import APIRouter, HTTPException, status
from fastapi.responses import StreamingResponse
from typing import Optional
import time
from datetime import datetime
from bson import ObjectId

from app.models.schemas import (
    AnalyzeTextRequest,
    AnalysisResult,
    HistoryResponse,
    HistoryItem,
    StatsResponse,
    ErrorResponse,
    TrainingChallengeResponse,
    TrainingChallenge,
    TrainingAttemptRequest,
    TrainingAttemptResponse,
    TrainingScore,
    PrivacyChatRequest,
    PrivacyChatResponse,
    AssistantChatRequest,
    AssistantChatResponse,
    ProfileRiskRequest,
    ProfileRiskResponse,
    LinkedInAnalyzeRequest,
    LinkedInAnalysisResult,
    GitHubAnalyzeRequest,
    GitHubAnalysisResult,
)
from app.nlp import nlp_service
from app.ml import ml_service
from app.llm import llm_service
from app import scraper
from app.db import (
    get_database, use_memory_storage, 
    memory_insert_one, memory_find_one, memory_find, 
    memory_count, memory_delete_one, memory_aggregate
)

router = APIRouter()


# --- In-memory training challenges (static seed set for now) ---
TRAINING_CHALLENGES = {
    "1": TrainingChallenge(
        id="1",
        prompt="Remove sensitive personal information from this post",
        risky_text="Hi! I'm Sarah from New York. Call me at 555-1234!",
        tips=["Remove exact names", "Remove phone numbers", "Use general locations"],
    ),
    "2": TrainingChallenge(
        id="2",
        prompt="Make this birthday post privacy-safe",
        risky_text="Happy birthday to my son James! He turns 8 today, born on March 15, 2016!",
        tips=["Avoid exact dates of birth", "Use general age references"],
    ),
    "3": TrainingChallenge(
        id="3",
        prompt="Protect work and contact details in this introduction",
        risky_text="Hey everyone! I'm Rahul Sharma, living at 23/7 MG Road, Bengaluru. Here's my Aadhaar 1234-5678-9012 and PAN ABCTY1234Z so clients can verify me. You can also call me on 98765-43210 anytime!",
        tips=["Remove government IDs completely", "Generalize addresses", "Remove phone numbers"],
    ),
    "4": TrainingChallenge(
        id="4",
        prompt="Rewrite this travel post without revealing your exact location",
        risky_text="Currently at Dubai International Airport, Terminal 3, Gate B7. Flight EK-505 to Mumbai delayed by 2 hours. Staying at Hilton Garden Inn, room 402.",
        tips=["Use city names instead of exact locations", "Avoid gate/room numbers", "Keep general travel updates"],
    ),
    "5": TrainingChallenge(
        id="5",
        prompt="Make this job application post safer",
        risky_text="Just applied to Google! My employee ID at current company is EMP-2024-1156. Email me at john.doe@company.com or call 9876543210.",
        tips=["Remove employee IDs", "Remove personal email addresses", "Remove phone numbers"],
    ),
    "6": TrainingChallenge(
        id="6",
        prompt="Protect all sensitive details in this medical update",
        risky_text="Just got diagnosed at Apollo Hospital, Bengaluru. My patient ID is APH-2024-88921. Doctor Priya Sharma prescribed medication. Insurance claim number: INS-445-2024. Follow-up on January 25, 2024 at 3:30 PM.",
        tips=["Remove patient IDs", "Remove doctor names", "Remove exact appointments", "Remove claim numbers"],
    ),
    "7": TrainingChallenge(
        id="7",
        prompt="Secure this financial transaction post",
        risky_text="Transferred ₹50,000 from my HDFC account (A/C: 1234567890) to Airtel (transaction ID: TXN-2024-998877). UPI ID: john@paytm. Receipt shows transaction on Dec 15, 2024 at 14:23:45.",
        tips=["Remove account numbers", "Remove transaction IDs", "Remove UPI IDs", "Generalize timestamps"],
    ),
    "8": TrainingChallenge(
        id="8",
        prompt="Anonymize this family emergency post",
        risky_text="My daughter Emily (DOB: 04/12/2015, Aadhaar: 9988-7766-5544) is admitted at AIIMS, New Delhi, Ward 5C, Bed 23. Emergency contact: Dr. Amit Kumar, 9123456789. Insurance: Policy #POL-2023-7788.",
        tips=["Remove all government IDs", "Remove exact ward/bed numbers", "Remove doctor contacts", "Remove policy numbers"],
    ),
    "9": TrainingChallenge(
        id="9",
        prompt="Completely anonymize this detailed business post",
        risky_text="Our startup (CIN: U74999KA2023PTC165432) raised $2M! Registered at #45, 3rd Floor, Koramangala, Bengaluru-560034. Contact: ceo@startup.com, +91-80-12345678. PAN: AABCS1234F, GST: 29AABCS1234F1Z5. Pitch deck: drive.google.com/file/d/abc123xyz",
        tips=["Remove all registration numbers", "Remove exact addresses with pin codes", "Remove tax IDs", "Remove document links", "Remove email/phone"],
    ),
    "10": TrainingChallenge(
        id="10",
        prompt="Secure this complex identity verification post",
        risky_text="Verified my identity using Aadhaar 1111-2222-3333, PAN ABCDE1234F, Passport J1234567 issued on 01/Jan/2020 from Mumbai office. Driving License: MH-01-2024-123456. Voter ID: ABC1234567. Bank verified via passbook showing IFSC: HDFC0001234, Account: 12340056789.",
        tips=["Remove ALL government-issued IDs", "Remove bank details completely", "Remove issue dates and locations", "Keep only general concept"],
    ),
}


@router.post("/analyze-text", response_model=AnalysisResult)
async def analyze_text(request: AnalyzeTextRequest):
    """
    Analyze text for privacy risks
    
    Process:
    1. NLP - Detect PII entities
    2. ML - Calculate risk score
    3. LLM - Generate recommendations (optional)
    4. Save to database
    """
    start_time = time.time()
    
    try:
        # Step 1: NLP - Detect PII
        pii_entities = nlp_service.detect_pii(request.text)
        entity_counts = nlp_service.extract_entity_counts(pii_entities)
        sensitive_keywords = nlp_service.detect_sensitive_keywords(request.text)
        
        # Step 2: Extract features
        features = ml_service.extract_features(
            request.text, 
            entity_counts, 
            sensitive_keywords
        )
        
        # Step 3: ML - Calculate risk score
        risk_score = ml_service.calculate_risk_score(features)
        
        # Step 4: LLM - Generate recommendations (if enabled)
        recommendations = []
        safe_rewrite = None
        
        if request.include_recommendations:
            recommendations = llm_service.generate_recommendations(
                request.text,
                pii_entities,
                risk_score.level
            )
        
        if request.include_rewrite and len(pii_entities) > 0:
            safe_rewrite = llm_service.rewrite_text_safely(
                request.text,
                pii_entities
            )
        
        # Calculate processing time
        processing_time = time.time() - start_time
        
        # Generate analysis ID
        analysis_id = str(ObjectId())
        
        # Step 5: Save to database or memory
        analysis_doc = {
            "_id": ObjectId(analysis_id),
            "user_id": request.user_id,
            "input_text": request.text,
            "pii_entities": [e.dict() for e in pii_entities],
            "features": features.dict(),
            "risk_score": risk_score.dict(),
            "recommendations": recommendations,
            "safe_rewrite": safe_rewrite,
            "processing_time": processing_time,
            "timestamp": datetime.utcnow()
        }
        
        if use_memory_storage():
            await memory_insert_one("analysis_results", analysis_doc)
        else:
            db = get_database()
            await db.analysis_results.insert_one(analysis_doc)
        
        # Build response
        result = AnalysisResult(
            analysis_id=analysis_id,
            input_text=request.text,
            pii_entities=pii_entities,
            features=features,
            risk_score=risk_score,
            recommendations=recommendations,
            safe_rewrite=safe_rewrite,
            processing_time=processing_time
        )

        return result

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis failed: {str(e)}"
        )


@router.get("/training/challenge", response_model=TrainingChallengeResponse)
async def get_training_challenge(challenge_id: Optional[str] = None):
    """Return a privacy training challenge for gamified practice.

    For now, serves a small static set of challenges from memory. Later this
    can be moved to the database or generated dynamically.
    """
    try:
        if challenge_id and challenge_id in TRAINING_CHALLENGES:
            challenge = TRAINING_CHALLENGES[challenge_id]
        else:
            # Default to first challenge
            challenge = next(iter(TRAINING_CHALLENGES.values()))

        return TrainingChallengeResponse(challenge=challenge)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to load training challenge: {str(e)}",
        )


@router.post("/training/attempt", response_model=TrainingAttemptResponse)
async def score_training_attempt(payload: TrainingAttemptRequest):
    """Auto-score a user's rewritten paragraph for a training challenge.

    Scoring is based on reduction of PII entities compared to the original
    risky text, plus a simple heuristic for length preservation.
    """
    if payload.challenge_id not in TRAINING_CHALLENGES:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unknown challenge_id",
        )

    challenge = TRAINING_CHALLENGES[payload.challenge_id]

    try:
        # Detect PII in original and user text
        original_pii = nlp_service.detect_pii(challenge.risky_text)
        user_pii = nlp_service.detect_pii(payload.user_text)

        original_count = len(original_pii)
        user_count = len(user_pii)

        # Debug logging
        print(f"DEBUG - Original PII count: {original_count}, User PII count: {user_count}")
        print(f"DEBUG - Original text: {challenge.risky_text}")
        print(f"DEBUG - User text: {payload.user_text}")
        
        # PII reduction score - VERY generous scoring
        if original_count == 0:
            pii_reduction_score = 100.0 if user_count == 0 else 60.0
        else:
            reduction = max(original_count - user_count, 0)
            # Give generous base score of 40 points just for attempting
            base_score = 40.0
            # Scale remaining 60 points based on reduction
            reduction_bonus = (reduction / original_count) * 60.0
            pii_reduction_score = base_score + reduction_bonus
            
            # If they removed at least half the PII, give +15 bonus
            if reduction >= original_count / 2:
                pii_reduction_score = min(100.0, pii_reduction_score + 15.0)
            # If they removed ANY PII at all, give +10 bonus
            elif reduction > 0:
                pii_reduction_score = min(100.0, pii_reduction_score + 10.0)

        # Clarity: keep length in a reasonable band (60%–140% of original)
        orig_len = len(challenge.risky_text)
        user_len = len(payload.user_text)
        length_ratio = user_len / orig_len if orig_len > 0 else 1.0

        if 0.6 <= length_ratio <= 1.4:
            clarity_score = 90.0
        elif 0.4 <= length_ratio <= 1.8:
            clarity_score = 70.0
        else:
            clarity_score = 50.0

        # Style is a simple average of the other two for now
        style_score = (pii_reduction_score + clarity_score) / 2.0

        total_score = (pii_reduction_score * 0.5) + (clarity_score * 0.3) + (style_score * 0.2)

        feedback: list[str] = []
        if user_count == 0:
            feedback.append("✓ Perfect! Your rewrite removes all detected personal identifiers.")
        elif user_count < original_count:
            removed = original_count - user_count
            feedback.append(f"Good effort! You removed {removed} of {original_count} sensitive details.")
            if user_count > 0:
                feedback.append(f"Try to remove the remaining {user_count} PII element(s) for a better score.")
        else:
            feedback.append("Your rewrite still exposes similar levels of PII. Try generalizing more.")

        if not (0.6 <= length_ratio <= 1.4):
            feedback.append("Tip: Keep the rewrite roughly the same length as the original.")

        if pii_reduction_score < 50:
            feedback.append("Focus on removing names, addresses, ID numbers, phone numbers, and exact dates.")

        score = TrainingScore(
            total_score=round(total_score, 1),
            pii_reduction_score=round(pii_reduction_score, 1),
            clarity_score=round(clarity_score, 1),
            style_score=round(style_score, 1),
            feedback=feedback,
        )

        return TrainingAttemptResponse(
            challenge_id=payload.challenge_id,
            user_text=payload.user_text,
            original_text=challenge.risky_text,
            score=score,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to score training attempt: {str(e)}",
        )


@router.get("/risk-report/{analysis_id}", response_model=AnalysisResult)
async def get_risk_report(analysis_id: str):
    """Get detailed risk report by analysis ID"""
    try:
        # Fetch from database or memory
        if use_memory_storage():
            result = await memory_find_one("analysis_results", {"_id": ObjectId(analysis_id)})
        else:
            db = get_database()
            result = await db.analysis_results.find_one({"_id": ObjectId(analysis_id)})
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Analysis {analysis_id} not found"
            )
        
        # Convert to response model
        return AnalysisResult(
            analysis_id=str(result["_id"]),
            input_text=result["input_text"],
            pii_entities=result["pii_entities"],
            features=result["features"],
            risk_score=result["risk_score"],
            recommendations=result.get("recommendations", []),
            safe_rewrite=result.get("safe_rewrite"),
            processing_time=result["processing_time"],
            timestamp=result["timestamp"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch report: {str(e)}"
        )


@router.get("/export-pdf/{analysis_id}")
async def export_pdf_report(analysis_id: str):
    """Export analysis report as PDF"""
    try:
        # Fetch from database or memory
        if use_memory_storage():
            result = await memory_find_one("analysis_results", {"_id": ObjectId(analysis_id)})
        else:
            db = get_database()
            result = await db.analysis_results.find_one({"_id": ObjectId(analysis_id)})
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Analysis {analysis_id} not found"
            )
        
        # Convert ObjectId to string for PDF generation
        analysis_data = {
            "analysis_id": str(result["_id"]),
            "input_text": result["input_text"],
            "pii_entities": result.get("pii_entities", []),
            "features": result.get("features", {}),
            "risk_score": result.get("risk_score", {}),
            "recommendations": result.get("recommendations", []),
            "safe_rewrite": result.get("safe_rewrite"),
            "processing_time": result.get("processing_time", 0),
            "timestamp": result.get("timestamp")
        }
        
        # Generate PDF
        from app.utils.pdf_generator import pdf_generator
        pdf_buffer = pdf_generator.generate_analysis_report(analysis_data)
        
        # Return as streaming response
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=privacy-report-{analysis_id}.pdf"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate PDF: {str(e)}"
        )


@router.get("/history", response_model=HistoryResponse)
async def get_history(user_id: Optional[str] = None, limit: int = 50):
    """Get analysis history"""
    try:
        # Build query
        query = {}
        if user_id:
            query["user_id"] = user_id
        
        # Fetch results from database or memory
        if use_memory_storage():
            results = await memory_find("analysis_results", query, sort=("timestamp", -1), limit=limit)
        else:
            db = get_database()
            cursor = db.analysis_results.find(query).sort("timestamp", -1).limit(limit)
            results = await cursor.to_list(length=limit)
        
        # Build history items
        items = []
        for result in results:
            items.append(HistoryItem(
                analysis_id=str(result["_id"]),
                timestamp=result["timestamp"],
                risk_level=result["risk_score"]["level"],
                risk_score=result["risk_score"]["score"],
                num_entities=len(result.get("pii_entities", [])),
                text_preview=result["input_text"][:100]
            ))
        
        return HistoryResponse(
            total=len(items),
            items=items
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch history: {str(e)}"
        )


@router.get("/stats", response_model=StatsResponse)
async def get_stats():
    """Get system statistics"""
    try:
        if use_memory_storage():
            # In-memory stats
            total_analyses = await memory_count("analysis_results")
            
            # Analyses by risk level
            pipeline = [
                {"$group": {
                    "_id": "$risk_score.level",
                    "count": {"$sum": 1}
                }}
            ]
            risk_counts = await memory_aggregate("analysis_results", pipeline)
            analyses_by_risk = {item["_id"]: item["count"] for item in risk_counts}
            
            # Most common entities
            pipeline = [
                {"$unwind": "$pii_entities"},
                {"$group": {
                    "_id": "$pii_entities.type",
                    "count": {"$sum": 1}
                }},
                {"$sort": {"count": -1}},
                {"$limit": 10}
            ]
            entity_counts = await memory_aggregate("analysis_results", pipeline)
            most_common_entities = {item["_id"]: item["count"] for item in entity_counts}
            
            # Average risk score
            pipeline = [
                {"$group": {
                    "_id": None,
                    "avg_score": {"$avg": "$risk_score.score"},
                    "avg_time": {"$avg": "$processing_time"}
                }}
            ]
            averages = await memory_aggregate("analysis_results", pipeline)
            
            avg_score = averages[0]["avg_score"] if averages else 0
            avg_time = averages[0]["avg_time"] if averages else 0
            
        else:
            # MongoDB stats
            db = get_database()
            total_analyses = await db.analysis_results.count_documents({})
            
            # Analyses by risk level
            pipeline = [
                {"$group": {
                    "_id": "$risk_score.level",
                    "count": {"$sum": 1}
                }}
            ]
            risk_counts = await db.analysis_results.aggregate(pipeline).to_list(length=10)
            analyses_by_risk = {item["_id"]: item["count"] for item in risk_counts}
            
            # Most common entities
            pipeline = [
                {"$unwind": "$pii_entities"},
                {"$group": {
                    "_id": "$pii_entities.type",
                    "count": {"$sum": 1}
                }},
                {"$sort": {"count": -1}},
                {"$limit": 10}
            ]
            entity_counts = await db.analysis_results.aggregate(pipeline).to_list(length=10)
            most_common_entities = {item["_id"]: item["count"] for item in entity_counts}
            
            # Average risk score
            pipeline = [
                {"$group": {
                    "_id": None,
                    "avg_score": {"$avg": "$risk_score.score"},
                    "avg_time": {"$avg": "$processing_time"}
                }}
            ]
            averages = await db.analysis_results.aggregate(pipeline).to_list(length=1)
            
            avg_score = averages[0]["avg_score"] if averages else 0
            avg_time = averages[0]["avg_time"] if averages else 0
        
        return StatsResponse(
            total_analyses=total_analyses,
            analyses_by_risk=analyses_by_risk,
            most_common_entities=most_common_entities,
            average_risk_score=round(avg_score, 2),
            average_processing_time=round(avg_time, 3)
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch stats: {str(e)}"
        )


@router.delete("/analysis/{analysis_id}")
async def delete_analysis(analysis_id: str):
    """Delete an analysis"""
    try:
        if use_memory_storage():
            deleted_count = await memory_delete_one("analysis_results", {"_id": ObjectId(analysis_id)})
            if deleted_count == 0:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Analysis {analysis_id} not found"
                )
        else:
            db = get_database()
            result = await db.analysis_results.delete_one({"_id": ObjectId(analysis_id)})
            
            if result.deleted_count == 0:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Analysis {analysis_id} not found"
                )
        
        return {"message": "Analysis deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete analysis: {str(e)}"
        )


@router.post("/privacy-chat", response_model=PrivacyChatResponse)
async def privacy_chat(request: PrivacyChatRequest):
    """Interactive privacy assistant endpoint (non-text-analysis).

    Users can ask conceptual questions like "Is it safe to share Aadhaar on WhatsApp?"
    and receive general best-practice guidance. This does NOT store any history.
    """
    if not llm_service.enabled:
        return PrivacyChatResponse(
            answer=(
                "The AI assistant feature is currently disabled because an API key "
                "has not been configured. Please set either OPENAI_API_KEY or "
                "GEMINI_API_KEY in your .env file to enable this feature."
            ),
            disclaimer="Feature not available.",
        )
    try:
        answer = llm_service.answer_privacy_question(
            question=request.question,
            locale=request.locale or "IN",
        )
        return PrivacyChatResponse(
            answer=answer,
            disclaimer=(
                "Educational use only. This response is not legal advice "
                "and may not cover your exact situation."
            ),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to answer privacy question: {str(e)}",
        )


async def _fetch_profile_text(request: ProfileRiskRequest) -> str:
    """Fetch public profile text for LinkedIn/X.

    To stay safe with platform terms, this demo does NOT actually scrape websites.
    In a real deployment, either:
      * Use official APIs, or
      * Ask the user to paste/export their profile text.
    """
    if request.source.value == "LINKEDIN":
        return (
            f"Demo LinkedIn profile for {request.identifier}. The user shares job titles, "
            f"education, and some contact channels that may include email or phone."
        )
    else:
        return (
            f"Demo X/Twitter profile timeline for {request.identifier}. The user posts casual "
            f"updates, may mention live locations, workplaces, and personal preferences."
        )


@router.post("/profile-risk", response_model=ProfileRiskResponse)
async def analyze_profile_risk(request: ProfileRiskRequest):
    """Analyze privacy risk of an external profile (LinkedIn or X/Twitter).

    This reuses the existing NLP/ML/LLM pipeline. For now, a placeholder text
    is generated based on the identifier instead of scraping.
    """
    try:
        profile_text = await _fetch_profile_text(request)

        pii_entities = nlp_service.detect_pii(profile_text)
        entity_counts = nlp_service.extract_entity_counts(pii_entities)
        sensitive_keywords = nlp_service.detect_sensitive_keywords(profile_text)

        features = ml_service.extract_features(
            profile_text,
            entity_counts,
            sensitive_keywords,
        )

        risk_score = ml_service.calculate_risk_score(features)

        recommendations: list[str] = []
        safe_rewrite: Optional[str] = None

        if request.include_recommendations:
            recommendations = llm_service.generate_recommendations(
                profile_text,
                pii_entities,
                risk_score.level,
            )

        if request.include_rewrite and len(pii_entities) > 0:
            safe_rewrite = llm_service.rewrite_text_safely(profile_text, pii_entities)

        processing_time = 0.0

        base = AnalysisResult(
            analysis_id="profile-demo",  # not persisted currently
            input_text=profile_text,
            pii_entities=pii_entities,
            features=features,
            risk_score=risk_score,
            recommendations=recommendations,
            safe_rewrite=safe_rewrite,
            processing_time=processing_time,
        )

        return ProfileRiskResponse(
            **base.dict(),
            source=request.source,
            identifier=request.identifier,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Profile risk analysis failed: {str(e)}",
        )


@router.post("/analyze-linkedin", response_model=LinkedInAnalysisResult)
async def analyze_linkedin_profile(request: LinkedInAnalyzeRequest):
    """
    Analyze LinkedIn profile for privacy risks
    
    Process:
    1. Scrape public LinkedIn profile data
    2. Detect exposed PII (email, phone, address)
    3. Analyze privacy settings and visibility
    4. Calculate privacy risk score
    5. Generate recommendations
    """
    try:
        # Scrape LinkedIn profile
        profile_data = scraper.scrape_linkedin_profile(request.profile_url)
        
        # Convert exposed_pii to schema models
        from app.models.schemas import LinkedInExposedPII, LinkedInPrivacyIssue, LinkedInPrivacyScore
        
        exposed_pii = [
            LinkedInExposedPII(**pii) for pii in profile_data.get('exposed_pii', [])
        ]
        
        privacy_issues = [
            LinkedInPrivacyIssue(**issue) for issue in profile_data.get('privacy_issues', [])
        ]
        
        privacy_score_data = profile_data.get('privacy_score', {})
        privacy_score = LinkedInPrivacyScore(**privacy_score_data)
        
        # Build result
        result = LinkedInAnalysisResult(
            url=profile_data['url'],
            name=profile_data.get('name'),
            headline=profile_data.get('headline'),
            location=profile_data.get('location'),
            about=profile_data.get('about'),
            profile_picture_url=profile_data.get('profile_picture_url'),
            exposed_pii=exposed_pii,
            privacy_issues=privacy_issues,
            public_visibility=profile_data.get('public_visibility', {}),
            privacy_score=privacy_score,
            recommendations=profile_data.get('recommendations', []),
        )
        
        return result
        
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"LinkedIn profile analysis failed: {str(e)}",
        )


@router.post("/analyze-github", response_model=GitHubAnalysisResult)
async def analyze_github_profile(request: GitHubAnalyzeRequest):
    """
    Analyze GitHub profile for privacy risks using GitHub API
    
    Process:
    1. Fetch GitHub profile using official API
    2. Scan public repositories for exposed secrets
    3. Check commit history for exposed emails
    4. Analyze privacy settings and visibility
    5. Calculate privacy risk score
    6. Generate recommendations
    """
    try:
        from app.core.config import settings
        
        # Use token from request or fall back to config
        github_token = request.github_token or settings.GITHUB_TOKEN or None
        
        # Scan GitHub profile
        scan_data = scraper.scan_github_profile(
            username=request.username,
            github_token=github_token
        )
        
        # Convert to schema models
        from app.models.schemas import (
            GitHubProfileInfo,
            GitHubRepositoryInfo,
            GitHubExposedSecret,
            GitHubPrivacyIssue,
            GitHubPrivacyScore
        )
        
        profile_info = GitHubProfileInfo(**scan_data['profile'])
        
        repositories = [
            GitHubRepositoryInfo(**repo) for repo in scan_data['repositories']
        ]
        
        exposed_secrets = [
            GitHubExposedSecret(**secret) for secret in scan_data['exposed_secrets']
        ]
        
        privacy_issues = [
            GitHubPrivacyIssue(**issue) for issue in scan_data['privacy_issues']
        ]
        
        privacy_score = GitHubPrivacyScore(**scan_data['privacy_score'])
        
        # Build result
        result = GitHubAnalysisResult(
            username=scan_data['username'],
            profile=profile_info,
            repositories=repositories,
            exposed_secrets=exposed_secrets,
            privacy_issues=privacy_issues,
            commit_emails=scan_data['commit_emails'],
            privacy_score=privacy_score,
            recommendations=scan_data['recommendations']
        )
        
        return result
        
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"GitHub profile analysis failed: {str(e)}",
        )


@router.post("/assistant/chat", response_model=AssistantChatResponse)
async def assistant_chat(request: AssistantChatRequest):
    """
    AI Privacy Assistant - Chat with SafeBuddy
    
    Provides conversational privacy advice and guidance using Gemini/OpenAI.
    """
    try:
        # Get response from LLM service
        answer = llm_service.answer_privacy_question(
            question=request.message,
            locale="IN"  # Default to Indian context, can be made configurable
        )
        
        return AssistantChatResponse(reply=answer)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Assistant chat failed: {str(e)}"
        )


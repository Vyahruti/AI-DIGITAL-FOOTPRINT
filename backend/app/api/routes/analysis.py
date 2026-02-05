"""
API Routes - Analysis Endpoints
"""

from fastapi import APIRouter, HTTPException, status
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
    ErrorResponse
)
from app.nlp import nlp_service
from app.ml import ml_service
from app.llm import llm_service
from app.db import (
    get_database, use_memory_storage, 
    memory_insert_one, memory_find_one, memory_find, 
    memory_count, memory_delete_one, memory_aggregate
)

router = APIRouter()


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

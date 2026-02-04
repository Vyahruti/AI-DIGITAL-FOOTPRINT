# 🔐 AI-Powered Privacy Footprint Analyzer

> **A production-ready, multi-layer AI system for detecting privacy risks in text using NLP, Machine Learning, and Large Language Models**

[![Python](https://img.shields.io/badge/Python-3.11-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-green.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen.svg)](PROJECT_SUMMARY.md)

---

## 🎯 Project Scope

**Core Purpose:** This system analyzes user-provided public text data (social media posts, bios, forum content) to detect privacy risks using hybrid AI techniques.

### Scope Definition (LOCKED)
✅ **What This System Does:**
- Analyzes user-pasted text or uploaded files
- Detects Personal Identifiable Information (PII)
- Provides risk scores and recommendations
- Suggests privacy-safe text rewrites

❌ **What This System Does NOT Do:**
- No live web scraping
- No login to real accounts
- No unauthorized data collection

**This ensures the project is legal, ethical, and evaluator-safe.**

---

## 🏗️ System Architecture

### Technology Stack

#### Backend
- **Framework:** FastAPI (Python)
- **NLP Engine:** spaCy + Microsoft Presidio
- **ML Models:** Scikit-learn (Logistic Regression → Random Forest)
- **LLM Integration:** OpenAI GPT-3.5/4 or LLaMA-3
- **Agent Orchestration:** LangChain
- **Database:** MongoDB

#### Frontend
- **Framework:** React
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Icons:** Lucide Icons

#### DevOps
- **Version Control:** Git + GitHub
- **Deployment:** Render / Railway (optional)

---

## 🧠 AI Architecture (Multi-Layer Approach)

### 1️⃣ NLP Layer (Foundation)
**Purpose:** Text understanding and entity extraction

**Tools:**
- **spaCy:** Named Entity Recognition (NER)
- **Microsoft Presidio:** Purpose-built PII detection

**Entities Detected:**
- PERSON
- LOCATION
- EMAIL_ADDRESS
- PHONE_NUMBER
- DATE_TIME
- ORGANIZATION
- IP_ADDRESS
- CREDIT_CARD

### 2️⃣ Machine Learning Layer (Explainable AI)
**Purpose:** Risk categorization with interpretable features

**Models:**
- **Baseline:** Logistic Regression
- **Final:** Random Forest Classifier

**Features Extracted:**
- Number of emails detected
- Number of phone numbers
- Number of locations
- Post length
- Frequency of sensitive entities
- Entity density ratio

**Output:**
- Risk Category: LOW / MEDIUM / HIGH
- Probability score (0-100%)

**Evaluation Metrics:**
- Accuracy
- Precision & Recall
- F1-Score
- Confusion Matrix

### 3️⃣ LLM Layer (Contextual Intelligence)
**Purpose:** Advanced reasoning and recommendations

**Capabilities:**
- Contextual risk assessment
- Multi-signal PII analysis
- Human-friendly recommendations
- Privacy-safe text rewriting

**Note:** LLM augments (not replaces) NLP + ML layers

### 4️⃣ LangChain Agent (Orchestration)
**Purpose:** Intelligent decision-making system

**Agent Tools:**
- `pii_detector_tool` - Runs NLP analysis
- `risk_scorer_tool` - Applies ML model
- `recommendation_tool` - Generates suggestions via LLM
- `text_rewriter_tool` - Creates safe versions

**Decision Flow:**
1. Always run NLP + ML
2. Use LLM only when:
   - Risk score > 60%
   - Complex context detected
   - User requests recommendations

---

## 📊 Database Schema (MongoDB)

### Collections

#### 1. `users`
```json
{
  "_id": "ObjectId",
  "username": "string",
  "email": "string",
  "created_at": "datetime"
}
```

#### 2. `analysis_results`
```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "input_text": "string",
  "pii_entities": [
    {"type": "PERSON", "text": "John Doe", "start": 0, "end": 8}
  ],
  "risk_score": 75,
  "risk_level": "HIGH",
  "features": {
    "num_emails": 2,
    "num_phones": 1,
    "num_locations": 3,
    "text_length": 500,
    "entity_density": 0.012
  },
  "recommendations": ["string"],
  "safe_rewrite": "string",
  "timestamp": "datetime"
}
```

#### 3. `risk_scores`
```json
{
  "_id": "ObjectId",
  "analysis_id": "ObjectId",
  "ml_probability": 0.85,
  "llm_reasoning": "string",
  "feature_importance": {}
}
```

---

## 🔌 Backend API Endpoints

### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/analyze-text` | Analyze text for PII and risk |
| GET | `/api/risk-report/{id}` | Get detailed risk report |
| GET | `/api/history` | Get user's analysis history |
| POST | `/api/rewrite-text` | Get privacy-safe text version |
| GET | `/api/stats` | Get overall system statistics |

---

## 🎨 Frontend Pages

### 1. Home Page
- Project overview
- How it works
- Quick start guide

### 2. Analyze Page
- Text input area (paste or upload)
- File upload (.txt, .json)
- "Analyze" button
- Loading state

### 3. Results Page (CRITICAL)
**Must Include:**
- Risk Score (visual progress bar)
- Risk Level (color-coded badge)
- Highlighted sensitive text
- Detected entities table
- AI recommendations list
- Before vs. After comparison
- Export report button

### 4. History Page
- Past analyses (table/cards)
- Filter by risk level
- Search functionality
- Delete option

---

## 📈 Evaluation & Testing

### Test Dataset
- 50-100 manually labeled samples
- Categories: Low (30%), Medium (40%), High (30%)
- Sources: Synthetic social media posts

### Metrics to Report
1. **ML Model Performance**
   - Accuracy
   - Precision/Recall/F1 per class
   - ROC-AUC score
   - Confusion matrix

2. **NLP Performance**
   - Entity detection accuracy
   - False positive rate
   - Coverage (% of PII detected)

3. **System Performance**
   - Average response time
   - Throughput (requests/sec)

---

## 📚 Academic Keywords (Use These)

- **Hybrid AI System**
- **Agent-Based Architecture**
- **Explainable Machine Learning**
- **Privacy-by-Design**
- **Multi-Modal Intelligence**
- **Contextual Risk Assessment**
- **Named Entity Recognition (NER)**
- **Feature Engineering**
- **Model Interpretability**

---

## 🚀 Development Roadmap

### Week 1: Foundation
- ✅ Setup project structure
- ✅ FastAPI hello world
- ✅ React basic UI
- ✅ Git repository

### Week 2: NLP Layer
- ✅ spaCy integration
- ✅ Presidio integration
- ✅ PII detection pipeline
- ✅ Store results in MongoDB

### Week 3: ML Layer
- ✅ Feature extraction
- ✅ Train baseline model
- ✅ Train Random Forest
- ✅ Model evaluation

### Week 4: LLM Integration
- ✅ OpenAI/LLaMA setup
- ✅ LangChain agents
- ✅ Recommendation system
- ✅ Text rewriting

### Week 5: Frontend Polish
- ✅ Complete all pages
- ✅ Charts and visualizations
- ✅ Responsive design
- ✅ User testing

### Week 6: Evaluation & Documentation
- ✅ Create test dataset
- ✅ Run experiments
- ✅ Generate metrics
- ✅ Write academic report

---

## 📖 Report Structure

1. **Introduction** - Problem statement, objectives
2. **Literature Review** - Existing privacy tools, gaps
3. **System Architecture** - Multi-layer AI design
4. **Methodology** - NLP, ML, LLM approach
5. **Implementation** - Code structure, algorithms
6. **Results & Analysis** - Metrics, comparisons
7. **Conclusion & Future Scope** - Achievements, improvements

---

## 🎯 Success Criteria

✅ Detects 10+ types of PII  
✅ Risk scoring with >80% accuracy  
✅ LLM provides actionable recommendations  
✅ Professional UI with visualizations  
✅ Complete academic documentation  
✅ Working demo ready

---

## 📧 Contact & Credits

**Project Type:** Final Year Major Project (4-2)  
**Domain:** Artificial Intelligence, Privacy Engineering  
**Year:** 2026

---

*This project demonstrates advanced AI engineering with real-world privacy applications.*

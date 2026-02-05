# 🔒 PROJECT SCOPE LOCK (Day 0)

**Date Locked:** January 29, 2026

---

## ✅ Official Scope Statement

> **"The system analyzes user-provided public text data (social media posts, bios, forum content) to detect privacy risks using hybrid AI techniques (NLP + ML + LLM)."**

---

## What This System DOES

✅ **Accept User Input:**
- Text pasted directly into web interface
- File uploads (.txt, .json, .csv)
- Manual data entry

✅ **Analyze Privacy Risks:**
- Detect Personal Identifiable Information (PII)
- Calculate risk scores using ML models
- Generate contextual recommendations via LLM

✅ **Provide Intelligence:**
- Highlight sensitive data in text
- Explain why data is risky
- Suggest privacy-safe alternatives
- Show before/after text rewrites

✅ **Store & Track:**
- Save analysis history (MongoDB)
- Show trends over time
- Export reports

---

## ❌ What This System Does NOT Do

❌ **No Live Scraping:**
- Does NOT crawl websites
- Does NOT extract data from live social media
- Does NOT use web scraping tools

❌ **No Authentication to External Services:**
- Does NOT log into Twitter/Facebook/Instagram
- Does NOT use social media APIs for data collection
- Does NOT access private accounts

❌ **No Unauthorized Data Collection:**
- Does NOT store data without consent
- Does NOT share data with third parties
- Does NOT violate GDPR/privacy laws

---

## 🎯 Why This Scope?

### 1️⃣ Legal Safety
- No risk of violating Terms of Service
- No copyright issues
- No data privacy violations

### 2️⃣ Technical Simplicity
- Focus on AI/ML algorithms (the core)
- No complex scraping infrastructure
- No rate limits or API restrictions

### 3️⃣ Evaluator-Friendly
- Easy to demonstrate in presentations
- Works offline (no dependencies on live services)
- Reproducible results

### 4️⃣ Academic Integrity
- Original AI implementation
- Novel privacy risk methodology
- Research-oriented evaluation

---

## 🔍 Example Use Cases (Within Scope)

### ✅ Valid Use Case 1: Social Media Post Analysis
**User Action:**
```
User copies this text:
"Hey everyone! I'm John Doe from NYC. 
Email me at john.doe@email.com or call 555-1234. 
Living at 123 Main St, excited to share my journey!"
```

**System Action:**
1. Detects: PERSON, LOCATION, EMAIL, PHONE, ADDRESS
2. Calculates risk: HIGH (85%)
3. Recommends: "Remove full name, use general location, hide contact info"
4. Rewrites: "Hey everyone! I'm from New York. DM me if you want to connect!"

---

### ✅ Valid Use Case 2: Resume Privacy Check
**User Action:**
```
User uploads resume.txt containing:
- Full name, address, phone
- Email, LinkedIn, GitHub
- Date of birth
```

**System Action:**
1. Identifies all PII entities
2. Risk level: MEDIUM (65%)
3. Suggests: "Use professional email, remove full address, keep LinkedIn"

---

### ✅ Valid Use Case 3: Forum Post Safety
**User Action:**
```
User pastes forum post:
"I'm struggling with anxiety. I live in Chicago, 
work at TechCorp, and my therapist suggested..."
```

**System Action:**
1. Detects: LOCATION, ORGANIZATION, HEALTH_INFO
2. Risk: HIGH (90%)
3. Warns: "Health data + identifiable info = major privacy risk"

---

## ❌ Invalid Use Cases (Out of Scope)

### ❌ Invalid: Automated Instagram Scraping
```
User: "Scrape my Instagram profile automatically"
System: ❌ OUT OF SCOPE - User must manually copy content
```

### ❌ Invalid: Real-Time Twitter Monitoring
```
User: "Monitor my tweets in real-time"
System: ❌ OUT OF SCOPE - No live API integration
```

### ❌ Invalid: Facebook Friend Analysis
```
User: "Analyze my friends' posts"
System: ❌ OUT OF SCOPE - Privacy violation
```

---

## 📋 Scope Enforcement Checklist

Before implementing ANY feature, ask:

- [ ] Does it require logging into external services? ❌ If yes, OUT OF SCOPE
- [ ] Does it involve live web scraping? ❌ If yes, OUT OF SCOPE
- [ ] Does it access data without user consent? ❌ If yes, OUT OF SCOPE
- [ ] Does it analyze only user-provided data? ✅ If yes, IN SCOPE
- [ ] Does it focus on AI/ML analysis? ✅ If yes, IN SCOPE
- [ ] Is it legally safe? ✅ If yes, IN SCOPE

---

## 🛡️ Privacy & Ethics Statement

This system is built with **Privacy-by-Design** principles:

1. **User Control:** Users decide what data to analyze
2. **No Tracking:** No cookies, no analytics, no user tracking
3. **Local Processing:** Option to run models locally (LLaMA)
4. **Data Minimization:** Only store what's necessary
5. **Transparency:** Users see exactly what's detected and why

---

## 🎓 Academic Justification

**For Evaluators:**

This project demonstrates:
- ✅ Advanced NLP techniques (spaCy, Presidio)
- ✅ Machine Learning (feature engineering, model training)
- ✅ Deep Learning (LLM integration via LangChain)
- ✅ System Design (multi-agent architecture)
- ✅ Real-world application (privacy engineering)

**NOT just a data collection tool** - it's an **AI research project** focused on privacy risk assessment algorithms.

---

## ✍️ Scope Signature

**Project Owner:** [Your Name]  
**Date:** January 29, 2026  
**Status:** 🔒 LOCKED

**I commit to this scope and will not deviate without explicit re-evaluation.**

---

## 📞 When in Doubt

If any feature request is unclear, apply this test:

> **"Can a user manually provide this data, or does it require automated collection?"**

- Manual = ✅ IN SCOPE
- Automated = ❌ OUT OF SCOPE

---

*Scope lock ensures project success, legal compliance, and clear evaluation criteria.*

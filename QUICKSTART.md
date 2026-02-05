# 🚀 Quick Start Guide

## Complete Setup in 5 Minutes

### Prerequisites
- Python 3.9+
- Node.js 18+
- MongoDB (local or cloud)
- OpenAI API key (optional)

---

## 🔹 Step 1: Clone & Navigate

```powershell
cd c:\Users\vyahu\OneDrive\Desktop\ai-footprint
```

---

## 🔹 Step 2: Backend Setup

```powershell
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Download spaCy model
python -m spacy download en_core_web_lg

# Copy environment file
cp .env.example .env

# Edit .env and add your MongoDB URL and OpenAI API key (optional)
# Then start the server
python main.py
```

Backend will run on: **http://localhost:8000**

Check API docs: **http://localhost:8000/api/docs**

---

## 🔹 Step 3: Frontend Setup

```powershell
# Open new terminal
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on: **http://localhost:3000**

---

## 🔹 Step 4: MongoDB Setup

**Option A: Local MongoDB**
```powershell
# Start MongoDB service
mongod
```

**Option B: MongoDB Atlas (Cloud - Recommended)**
1. Go to [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Get connection string
4. Update `MONGODB_URL` in `backend/.env`

---

## 🔹 Step 5: Train ML Model (Optional)

```powershell
cd backend

# Train the model with synthetic data
python scripts/train_model.py

# Evaluate the model
python scripts/evaluate_model.py

# Restart backend to load trained model
python main.py
```

---

## ✅ Verify Everything Works

1. **Backend Health Check:**
   - Visit: http://localhost:8000/health
   - Should see: `{"status": "healthy"}`

2. **Frontend:**
   - Visit: http://localhost:3000
   - Click "Start Analysis"

3. **Test Analysis:**
   - Paste sample text:
     ```
     Hi, I'm John Doe. Email: john@example.com, Phone: 555-1234.
     Living in NYC at 123 Main St.
     ```
   - Click "Analyze Privacy Risk"
   - View results!

---

## 📁 Project Structure Overview

```
ai-footprint/
├── backend/           # FastAPI + AI services
│   ├── app/
│   │   ├── nlp/      # spaCy + Presidio
│   │   ├── ml/       # Scikit-learn
│   │   ├── llm/      # LangChain + OpenAI
│   │   └── api/      # Routes
│   └── scripts/      # Training scripts
│
├── frontend/          # React + Tailwind
│   ├── src/
│   │   ├── pages/    # Home, Analyze, Results, History
│   │   └── components/
│   └── public/
│
├── README.md
├── PROJECT_SCOPE.md
└── .gitignore
```

---

## 🎯 Key Features Implemented

✅ **NLP Layer** - spaCy + Presidio for PII detection  
✅ **ML Layer** - Random Forest risk classifier  
✅ **LLM Layer** - GPT-powered recommendations  
✅ **Database** - MongoDB with Motor  
✅ **Frontend** - React with Tailwind CSS  
✅ **Visualization** - Risk scores, charts, highlighted text  
✅ **History** - Track past analyses  

---

## 🔧 Troubleshooting

### Backend won't start
```powershell
# Check if port 8000 is in use
netstat -ano | findstr :8000

# Kill process if needed
taskkill /PID <process_id> /F
```

### spaCy model missing
```powershell
python -m spacy download en_core_web_lg
# Or use smaller model:
python -m spacy download en_core_web_sm
```

### MongoDB connection error
- Verify MongoDB is running: `mongod --version`
- Check connection string in `.env`
- For Atlas, whitelist your IP address

### Frontend API errors
- Ensure backend is running on port 8000
- Check CORS settings in backend
- Clear browser cache

---

## 📚 Next Steps

1. ✅ **Customize** - Adjust colors, add features
2. 📊 **Train Model** - Collect real data and retrain
3. 📄 **Documentation** - Write academic report
4. 🎓 **Presentation** - Prepare demo
5. 🚀 **Deploy** - Host on Render/Railway

---

## 🆘 Need Help?

- **Backend Docs:** http://localhost:8000/api/docs
- **Check Logs:** Terminal output shows detailed errors
- **MongoDB Compass:** Visual MongoDB client
- **Postman:** Test API endpoints directly

---

## 🎓 For Academic Evaluation

This project demonstrates:
- ✅ Advanced NLP (Named Entity Recognition)
- ✅ Machine Learning (Classification, Feature Engineering)
- ✅ Deep Learning (LLM Integration via LangChain)
- ✅ Full-Stack Development (React + FastAPI)
- ✅ Database Design (MongoDB)
- ✅ API Design (RESTful)
- ✅ Privacy Engineering (PII Detection)

**Keywords:** Hybrid AI, Multi-Agent System, Explainable ML, Privacy-by-Design

---

**🎉 You're all set! Start analyzing privacy risks!**

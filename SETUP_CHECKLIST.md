# ✅ Setup Checklist

Follow this step-by-step to get everything running:

---

## 📋 Pre-Installation

- [ ] Python 3.9 or higher installed
  ```powershell
  python --version
  # Should show: Python 3.9.x or higher
  ```

- [ ] Node.js 18+ and npm installed
  ```powershell
  node --version
  npm --version
  # Node should be v18.x or higher
  ```

- [ ] MongoDB installed OR MongoDB Atlas account created
  - **Local:** Download from https://www.mongodb.com/try/download/community
  - **Cloud:** Sign up at https://www.mongodb.com/cloud/atlas (recommended, free tier)

- [ ] OpenAI API key (optional, for LLM features)
  - Get from: https://platform.openai.com/api-keys
  - Without this: System works with fallback recommendations

- [ ] Git installed (for version control)
  ```powershell
  git --version
  ```

---

## 🔧 Backend Setup

### Step 1: Navigate to Backend
```powershell
cd backend
```

### Step 2: Create Virtual Environment
```powershell
python -m venv venv
```

### Step 3: Activate Virtual Environment
```powershell
# Windows PowerShell
.\venv\Scripts\Activate.ps1

# If you get execution policy error:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

- [ ] Virtual environment activated (you should see `(venv)` in prompt)

### Step 4: Install Dependencies
```powershell
pip install -r requirements.txt
```

- [ ] All packages installed successfully (no errors)

### Step 5: Download spaCy Model
```powershell
python -m spacy download en_core_web_lg
```

- [ ] spaCy model downloaded (about 800MB)
  - If fails, try smaller model: `python -m spacy download en_core_web_sm`

### Step 6: Setup Environment Variables
```powershell
# Copy template
cp .env.example .env

# Edit .env file
notepad .env
```

Required settings in `.env`:
```env
MONGODB_URL=mongodb://localhost:27017  # OR your MongoDB Atlas connection string
OPENAI_API_KEY=sk-your-key-here       # Optional
```

- [ ] `.env` file created
- [ ] MongoDB URL configured
- [ ] OpenAI API key added (if available)

### Step 7: Test Backend
```powershell
python main.py
```

Expected output:
```
✅ Loaded spaCy model: en_core_web_lg
✅ Presidio Analyzer initialized
✅ Connected to MongoDB
🚀 Server running on http://0.0.0.0:8000
```

- [ ] Backend starts without errors
- [ ] Visit http://localhost:8000 → Shows `{"status": "healthy"}`
- [ ] Visit http://localhost:8000/api/docs → Shows API documentation

**Keep this terminal running!**

---

## 🎨 Frontend Setup

### Step 1: Open New Terminal
```powershell
# Open a NEW PowerShell window (keep backend running)
cd frontend
```

### Step 2: Install Dependencies
```powershell
npm install
```

- [ ] All npm packages installed (takes 2-3 minutes)

### Step 3: Start Development Server
```powershell
npm run dev
```

Expected output:
```
  VITE v5.0.11  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

- [ ] Frontend starts successfully
- [ ] Visit http://localhost:3000 → Shows homepage
- [ ] No console errors in browser DevTools

**Keep this terminal running!**

---

## 🗄️ Database Setup

### Option A: Local MongoDB

```powershell
# Start MongoDB
mongod
```

- [ ] MongoDB running on port 27017

### Option B: MongoDB Atlas (Recommended)

1. [ ] Go to https://www.mongodb.com/cloud/atlas
2. [ ] Sign up / Log in
3. [ ] Create new project
4. [ ] Build a cluster (FREE tier)
5. [ ] Create database user
6. [ ] Whitelist IP: `0.0.0.0/0` (allow all - for development)
7. [ ] Get connection string
8. [ ] Update `MONGODB_URL` in `backend/.env`

Connection string format:
```
mongodb+srv://username:password@cluster.mongodb.net/privacy_analyzer
```

---

## 🧪 Test the System

### Test 1: Health Check
```powershell
# Visit in browser:
http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": "connected",
  "services": {
    "nlp": "ready",
    "ml": "ready",
    "llm": "configured"
  }
}
```

- [ ] Health check passes

### Test 2: Frontend Homepage
```powershell
# Visit:
http://localhost:3000
```

- [ ] Homepage loads
- [ ] Navigation works
- [ ] Styling appears correctly
- [ ] No JavaScript errors in console

### Test 3: Full Analysis
1. [ ] Click "Start Analysis" or go to http://localhost:3000/analyze
2. [ ] Paste sample text:
```
Hi, I'm John Doe from New York. 
Email: john.doe@email.com
Phone: 555-123-4567
```
3. [ ] Click "Analyze Privacy Risk"
4. [ ] Results page loads within 2 seconds
5. [ ] Risk score displays (should be HIGH)
6. [ ] Entities are highlighted in text
7. [ ] Recommendations shown (at least 3)
8. [ ] Safe rewrite displayed

- [ ] End-to-end flow works

### Test 4: History
1. [ ] Go to http://localhost:3000/history
2. [ ] Previous analysis appears
3. [ ] Click "View Details" → loads results page
4. [ ] Delete works

- [ ] History functionality works

---

## 🤖 Train ML Model (Optional but Recommended)

```powershell
cd backend

# Make sure venv is activated
.\venv\Scripts\Activate.ps1

# Train model
python scripts/train_model.py
```

Expected output:
```
🚀 Starting ML Model Training Pipeline
📂 Loading training data...
✅ Loaded 500 samples
...
✅ Random Forest Accuracy: 0.8620
✅ Model saved to app/ml/models/risk_classifier.pkl
```

- [ ] Model trains successfully
- [ ] Accuracy > 80%
- [ ] Model files created in `app/ml/models/`

### Restart Backend
```powershell
# Stop backend (Ctrl+C)
# Start again
python main.py
```

Expected output:
```
✅ Loaded trained ML model from app/ml/models/risk_classifier.pkl
```

- [ ] Backend loads trained model

---

## 📊 Evaluate Model

```powershell
python scripts/evaluate_model.py
```

Expected output:
```
🚀 Starting Model Evaluation
...
📊 Overall Accuracy: 0.8620 (86.20%)
✅ Confusion matrix saved to results/confusion_matrix.png
✅ Feature importance plot saved to results/feature_importance.png
✅ LaTeX table saved to results/metrics_table.tex
```

- [ ] Evaluation completes
- [ ] PNG files created in `results/`
- [ ] Metrics look good (accuracy > 80%)

---

## 🚀 Deployment Checklist (Optional)

### Backend to Render

- [ ] Push code to GitHub
- [ ] Create Render account
- [ ] Create new Web Service
- [ ] Connect GitHub repository
- [ ] Configure build command:
```bash
pip install -r requirements.txt && python -m spacy download en_core_web_lg
```
- [ ] Configure start command:
```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```
- [ ] Add environment variables:
  - `MONGODB_URL`
  - `OPENAI_API_KEY`
- [ ] Deploy
- [ ] Test deployed URL

### Frontend to Vercel

- [ ] Create Vercel account
- [ ] Import GitHub repository
- [ ] Vercel auto-detects Vite
- [ ] Add environment variable:
  - `VITE_API_URL=https://your-backend.onrender.com/api`
- [ ] Deploy
- [ ] Test deployed URL

---

## 🐛 Troubleshooting

### Backend Issues

**Problem:** `ModuleNotFoundError`
```powershell
# Solution: Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

**Problem:** spaCy model not found
```powershell
# Solution: Download model
python -m spacy download en_core_web_lg
# Or use smaller model:
python -m spacy download en_core_web_sm
```

**Problem:** MongoDB connection failed
```
# Check if MongoDB is running
mongod --version

# For Atlas: verify connection string in .env
# Make sure IP is whitelisted
```

**Problem:** Port 8000 already in use
```powershell
# Find and kill process
netstat -ano | findstr :8000
taskkill /PID <process_id> /F

# Or change port in backend/app/core/config.py
```

### Frontend Issues

**Problem:** `npm install` fails
```powershell
# Clear cache and retry
npm cache clean --force
npm install
```

**Problem:** Port 3000 already in use
```powershell
# Kill process
netstat -ano | findstr :3000
taskkill /PID <process_id> /F

# Or Vite will offer alternative port (3001)
```

**Problem:** API calls fail
- [ ] Check backend is running on port 8000
- [ ] Check CORS settings in `backend/app/core/config.py`
- [ ] Check browser console for errors
- [ ] Verify API URL in `frontend/src/api/client.js`

### General Issues

**Problem:** Execution policy error (Windows)
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Problem:** Git bash issues
- Use PowerShell instead
- Or use Git Bash with `source venv/Scripts/activate` (no `.ps1`)

---

## ✅ Final Verification

### Backend Running
- [ ] http://localhost:8000 → Shows status
- [ ] http://localhost:8000/health → Shows healthy
- [ ] http://localhost:8000/api/docs → Shows Swagger UI
- [ ] No errors in terminal

### Frontend Running
- [ ] http://localhost:3000 → Shows homepage
- [ ] Navigation works
- [ ] /analyze page accessible
- [ ] No errors in browser console

### Database Connected
- [ ] MongoDB running (local or Atlas)
- [ ] Backend logs show "Connected to MongoDB"
- [ ] Test analysis saves to database

### End-to-End Test
- [ ] Paste text → Analyze → See results
- [ ] Results show risk score
- [ ] Entities highlighted
- [ ] Recommendations displayed
- [ ] History saves analysis

### ML Model (if trained)
- [ ] Model file exists: `backend/app/ml/models/risk_classifier.pkl`
- [ ] Backend logs show "Loaded trained ML model"
- [ ] Accuracy > 80%

---

## 🎉 Success!

If all checkboxes are checked, **your system is fully operational!**

**What you now have:**
✅ Backend API running  
✅ Frontend UI running  
✅ Database connected  
✅ NLP layer working (spaCy + Presidio)  
✅ ML layer working (Random Forest)  
✅ LLM layer configured (GPT-3.5)  
✅ End-to-end analysis functional  

---

## 📚 Next Steps

1. **Read:** [NEXT_STEPS.md](NEXT_STEPS.md) - Complete guide for next tasks
2. **Train:** Collect real data and train better model
3. **Customize:** Change colors, add features
4. **Document:** Write academic report
5. **Present:** Create presentation slides
6. **Deploy:** Push to production (optional)

---

## 🆘 Need Help?

- **Quick Start:** See [QUICKSTART.md](QUICKSTART.md)
- **Project Summary:** See [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)
- **Backend Guide:** See [backend/README.md](backend/README.md)
- **Frontend Guide:** See [frontend/README.md](frontend/README.md)
- **Test Cases:** See [docs/TEST_CASES.md](docs/TEST_CASES.md)

---

**You're all set! Happy analyzing! 🔐✨**

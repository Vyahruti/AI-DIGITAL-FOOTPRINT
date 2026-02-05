# 🚀 Run Without Database (Quick Start)

**Perfect for initial testing without MongoDB setup!**

---

## Simple Setup (No Database)

The app will use **in-memory storage** (data won't persist after restart, but perfect for testing).

### Step 1: Backend Setup

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m spacy download en_core_web_lg
```

### Step 2: Create Minimal .env File

```powershell
# Create .env with just this line:
echo "MONGODB_URL=" > .env
```

Or manually create `backend/.env`:
```
# Leave MongoDB empty - will use in-memory storage
MONGODB_URL=

# OpenAI optional - works without it
OPENAI_API_KEY=
```

### Step 3: Modify MongoDB Connection (One-time)

Edit `backend/app/db/mongodb.py` and replace the `connect_to_mongo` function:

```python
async def connect_to_mongo():
    """Connect to MongoDB (with fallback to in-memory)"""
    if not settings.MONGODB_URL:
        print("⚠️  MongoDB not configured - using IN-MEMORY storage")
        print("    (Data will be lost on restart)")
        mongodb.client = None
        mongodb.db = None
        return
    
    try:
        mongodb.client = AsyncIOMotorClient(settings.MONGODB_URL, serverSelectionTimeoutMS=3000)
        mongodb.db = mongodb.client[settings.MONGODB_DB_NAME]
        # Test connection
        await mongodb.client.admin.command('ping')
        print("✅ Connected to MongoDB")
    except Exception as e:
        print(f"⚠️  MongoDB unavailable: {e}")
        print("    Using IN-MEMORY storage instead")
        mongodb.client = None
        mongodb.db = None
```

### Step 4: Add In-Memory Storage

Add this to `backend/app/db/mongodb.py` at the top (after imports):

```python
# In-memory storage fallback
_memory_storage = {}

def use_memory_storage():
    """Check if using in-memory storage"""
    return mongodb.db is None

async def memory_save(collection: str, document: dict):
    """Save to memory"""
    if collection not in _memory_storage:
        _memory_storage[collection] = []
    _memory_storage[collection].append(document)
    
async def memory_find_one(collection: str, query: dict):
    """Find one from memory"""
    if collection not in _memory_storage:
        return None
    for doc in _memory_storage[collection]:
        if all(doc.get(k) == v for k, v in query.items()):
            return doc
    return None

async def memory_find(collection: str, query: dict = None, limit: int = 10):
    """Find from memory"""
    if collection not in _memory_storage:
        return []
    items = _memory_storage.get(collection, [])
    if query:
        items = [doc for doc in items if all(doc.get(k) == v for k, v in query.items())]
    return items[:limit]

async def memory_count(collection: str, query: dict = None):
    """Count in memory"""
    items = await memory_find(collection, query, limit=999999)
    return len(items)

async def memory_delete(collection: str, query: dict):
    """Delete from memory"""
    if collection not in _memory_storage:
        return 0
    original = len(_memory_storage[collection])
    _memory_storage[collection] = [
        doc for doc in _memory_storage[collection]
        if not all(doc.get(k) == v for k, v in query.items())
    ]
    return original - len(_memory_storage[collection])
```

### Step 5: Update Analysis Routes

Edit `backend/app/api/routes/analysis.py` - replace database calls:

```python
# Import memory functions at top
from app.db.mongodb import (
    mongodb, use_memory_storage, memory_save, 
    memory_find_one, memory_find, memory_count, memory_delete
)

# In analyze_text endpoint - replace save section:
# Save to database
result_dict = result.model_dump()
if use_memory_storage():
    await memory_save("analysis_results", result_dict)
else:
    result_dict["_id"] = result_dict["analysis_id"]
    await mongodb.db.analysis_results.insert_one(result_dict)

# In get_risk_report - replace:
if use_memory_storage():
    result = await memory_find_one("analysis_results", {"analysis_id": analysis_id})
else:
    result = await mongodb.db.analysis_results.find_one({"analysis_id": analysis_id})

# In get_history - replace:
if use_memory_storage():
    results = await memory_find("analysis_results", limit=limit)
else:
    cursor = mongodb.db.analysis_results.find(query).sort("timestamp", -1).limit(limit)
    results = await cursor.to_list(length=limit)

# In get_stats - replace:
if use_memory_storage():
    total = await memory_count("analysis_results")
    high_risk = await memory_count("analysis_results", {"risk_score.level": "HIGH"})
    # ... etc
else:
    total = await mongodb.db.analysis_results.count_documents({})
    # ... etc

# In delete_analysis - replace:
if use_memory_storage():
    deleted = await memory_delete("analysis_results", {"analysis_id": analysis_id})
    if deleted == 0:
        raise HTTPException(status_code=404, detail="Analysis not found")
else:
    result = await mongodb.db.analysis_results.delete_one({"analysis_id": analysis_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Analysis not found")
```

### Step 6: Start Backend

```powershell
cd backend
.\venv\Scripts\Activate.ps1
python main.py
```

You should see:
```
⚠️  MongoDB not configured - using IN-MEMORY storage
    (Data will be lost on restart)
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Step 7: Start Frontend

```powershell
cd frontend
npm install
npm run dev
```

---

## Even Simpler: Skip History Features

If you don't want to modify code, just:

1. **Remove history/stats API calls** from frontend
2. Use only the `/analyze-text` endpoint
3. Accept that history page won't work

Edit `frontend/src/api/client.js`:
```javascript
// Comment out these functions:
// export const getHistory = async () => { ... }
// export const getStats = async () => { ... }
```

Edit `frontend/src/App.jsx`:
```javascript
// Remove history route:
// <Route path="/history" element={<HistoryPage />} />
```

Now you can run with **zero database setup**!

---

## What Works Without Database

✅ Analyze Text (main feature)  
✅ View Results  
✅ Entity Detection  
✅ Risk Scoring  
✅ AI Recommendations  
✅ Safe Text Rewrite  

❌ History (past analyses)  
❌ Statistics  
❌ Data persistence  

---

## Later: Add MongoDB

When ready for full features:

1. Sign up for [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free tier)
2. Get connection string
3. Update `.env`: `MONGODB_URL=mongodb+srv://user:pass@cluster.mongodb.net/`
4. Restart backend

That's it! 🎉

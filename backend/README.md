# Backend Setup Guide

## 📋 Prerequisites

- Python 3.9 or higher
- MongoDB (local or cloud)
- OpenAI API key (optional, for LLM features)

## 🚀 Quick Start

### 1. Create Virtual Environment

```powershell
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1
```

### 2. Install Dependencies

```powershell
# Install all required packages
pip install -r requirements.txt

# Download spaCy language model
python -m spacy download en_core_web_lg
```

### 3. Configure Environment

```powershell
# Copy environment template
cp .env.example .env

# Edit .env file and add your configuration
# Minimum required: MONGODB_URL
# Optional: OPENAI_API_KEY for LLM features
```

### 4. Start MongoDB

**Option A: Local MongoDB**
```powershell
# Start MongoDB service
mongod
```

**Option B: MongoDB Atlas (Cloud)**
- Get connection string from MongoDB Atlas
- Update MONGODB_URL in .env

### 5. Run the Server

```powershell
# Development mode (with auto-reload)
python main.py

# Or using uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **API**: http://localhost:8000
- **Docs**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc

## 📁 Project Structure

```
backend/
├── app/
│   ├── api/              # API routes
│   │   └── routes/
│   │       └── analysis.py
│   ├── core/             # Core configuration
│   │   └── config.py
│   ├── db/               # Database connections
│   │   └── mongodb.py
│   ├── models/           # Pydantic models
│   │   └── schemas.py
│   ├── nlp/              # NLP services (spaCy, Presidio)
│   │   └── pii_detector.py
│   ├── ml/               # ML services (scikit-learn)
│   │   └── risk_scorer.py
│   └── llm/              # LLM services (LangChain)
│       └── llm_service.py
├── main.py               # Application entry point
├── requirements.txt      # Python dependencies
└── .env.example          # Environment template
```

## 🧪 Testing the API

### Using curl

```powershell
# Health check
curl http://localhost:8000/health

# Analyze text
curl -X POST http://localhost:8000/api/analyze-text `
  -H "Content-Type: application/json" `
  -d '{\"text\": \"Hi, I am John Doe. Email me at john@example.com or call 555-1234.\"}'
```

### Using Python

```python
import requests

response = requests.post(
    "http://localhost:8000/api/analyze-text",
    json={
        "text": "Hi, I'm John Doe from NYC. Email: john@example.com",
        "include_recommendations": True,
        "include_rewrite": True
    }
)

print(response.json())
```

## 🔧 Development Tools

### Format Code

```powershell
black .
```

### Lint Code

```powershell
flake8 app/
```

### Type Checking

```powershell
mypy app/
```

### Run Tests

```powershell
pytest
```

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/health` | Detailed health check |
| POST | `/api/analyze-text` | Analyze text for PII |
| GET | `/api/risk-report/{id}` | Get analysis report |
| GET | `/api/history` | Get analysis history |
| GET | `/api/stats` | Get system statistics |
| DELETE | `/api/analysis/{id}` | Delete analysis |

## 🔑 Environment Variables

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `MONGODB_URL` | Yes | MongoDB connection string | `mongodb://localhost:27017` |
| `MONGODB_DB_NAME` | No | Database name | `privacy_analyzer` |
| `OPENAI_API_KEY` | No* | OpenAI API key | - |
| `OPENAI_MODEL` | No | LLM model to use | `gpt-3.5-turbo` |
| `HOST` | No | Server host | `0.0.0.0` |
| `PORT` | No | Server port | `8000` |
| `DEBUG` | No | Debug mode | `true` |

\* Required for LLM-powered recommendations and text rewriting

## 🐛 Troubleshooting

### spaCy Model Not Found

```powershell
# Download the large English model
python -m spacy download en_core_web_lg

# Or use smaller model (fallback)
python -m spacy download en_core_web_sm
```

### MongoDB Connection Error

- Ensure MongoDB is running
- Check MONGODB_URL in .env
- Verify MongoDB service is accessible

### Import Errors

```powershell
# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

### OpenAI API Errors

- Verify OPENAI_API_KEY is correct
- Check API quota/billing
- System works without OpenAI (fallback mode)

## 🚀 Deployment

### Using Render

1. Create `render.yaml`:

```yaml
services:
  - type: web
    name: ai-privacy-analyzer
    env: python
    buildCommand: "pip install -r requirements.txt && python -m spacy download en_core_web_lg"
    startCommand: "uvicorn main:app --host 0.0.0.0 --port $PORT"
    envVars:
      - key: PYTHON_VERSION
        value: 3.11.0
```

2. Connect GitHub repo
3. Add environment variables in Render dashboard

### Using Railway

```bash
railway init
railway up
```

## 📝 Next Steps

1. ✅ Backend is ready
2. 📱 Build React frontend
3. 🤖 Train ML models
4. 📊 Create evaluation dataset
5. 📄 Write documentation

## 🆘 Support

For issues or questions:
- Check API docs at `/api/docs`
- Review logs in terminal
- Verify environment configuration

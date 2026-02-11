# SafeBuddy Assistant Backend

This is the backend server for the AI Privacy Assistant (SafeBuddy).

## Setup

1. Make sure Node.js is installed
2. Install dependencies:
   ```bash
   npm install
   ```

3. Make sure your `.env` file has the Gemini API key:
   ```
   API_KEY=your_gemini_api_key_here
   ```

## Running the Server

**Option 1: Using the batch file (Windows)**
```bash
start.bat
```

**Option 2: Using npm**
```bash
npm start
```

**Option 3: Direct node command**
```bash
node server.js
```

The server will run on **http://localhost:5000**

## API Endpoint

**POST /chat**
- Request: `{ "message": "your question here" }`
- Response: `{ "reply": "AI response" }`

## Notes

- This server uses Google Gemini API for AI responses
- It's configured for privacy and safety advice
- Port 5000 must be available

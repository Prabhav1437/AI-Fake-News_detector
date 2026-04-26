# API Reference

The VeriNews AI backend provides a set of RESTful endpoints for news analysis and history retrieval.

## Base URL
`http://localhost:5001`

## Endpoints

### 1. Analyze News
`POST /api/analyze`

Analyzes a news article for potential misinformation.

**Request Body:**
```json
{
  "headline": "Breaking: Scientists find cure for everything",
  "content": "Full article text content...",
  "sourceUrl": "https://example.com/article",
  "screenshotBase64": "optional_base64_string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "cl...",
    "isLikelyFake": true,
    "confidenceScore": 92.5,
    "verdict": "DECEPTIVE",
    "analysisReason": "Lacks citations and uses extreme emotional language...",
    "scores": {
        "sensationalism": 85,
        "manipulative": 70,
        "objectivity": 20
    }
  }
}
```

### 2. Contextual Chat
`POST /api/chat`

Allows follow-up questions on a specific analysis.

**Request Body:**
```json
{
  "message": "Why exactly is this marked as deceptive?",
  "history": [],
  "originalAnalysis": { ... }
}
```

### 3. Evaluation
`GET /api/evaluate`

Runs an accuracy test against the local `dataset.json`. Returns metrics like Precision, Recall, and F1 Score.

### 4. History
`GET /api/history`

Retrieves the last 20 analyses from the database.

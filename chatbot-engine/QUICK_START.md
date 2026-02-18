# Quick Start Guide - Chatbot Engine

Get the chatbot running in 5 minutes!

## Prerequisites
- Python 3.8+
- pip

## Installation (2 minutes)

```bash
# Navigate to chatbot engine
cd chatbot-engine

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

## Run the Server (1 minute)

```bash
cd app
uvicorn routes:app --reload --host 0.0.0.0 --port 8000
```

Expected output:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
Initializing Chatbot Engine...
Loading tokenizer for Hindi...
Loading translation model for Hindi...
Loading model from app/models/intent_model.pkl
Model loaded successfully
Chatbot Engine ready!
```

## Test It! (2 minutes)

### Option 1: Using cURL

```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "2 kg rice chahiye"}'
```

**Response:**
```json
{
  "user_message": "2 kg rice chahiye",
  "language": "Hindi",
  "translated_text": "I want 2 kg rice",
  "intent": "ORDER",
  "confidence": 0.95,
  "entities": {
    "product": "rice",
    "quantity": 2.0
  },
  "reply": "Great! I can process your order for 2kg rice.",
  "quick_replies": ["Proceed to payment", "Check delivery", "Need more?"]
}
```

### Option 2: Interactive Swagger UI

Open in browser: **`http://localhost:8000/docs`**

- Click on "POST /chat"
- Click "Try it out"
- Enter message: `"2 kg rice chahiye"`
- Click "Execute"
- See response!

### Option 3: Using Python

```python
import requests

response = requests.post('http://localhost:8000/chat', json={
    "message": "2 kg rice chahiye"
})

print(response.json())
```

## More Test Cases

### Test English Message
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the price of wheat?"}'
```

### Test Hindi Message
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Namaste, rice ki keemat kya hai?"}'
```

### Test Delivery Inquiry
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "When will my order arrive?"}'
```

### Test Health Check
```bash
curl http://localhost:8000/health
```

## API Endpoints at a Glance

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/chat` | POST | Process user message |
| `/health` | GET | Check if running |
| `/intents` | GET | List all intents |
| `/products` | GET | List products |
| `/products/add` | POST | Add new product |
| `/train` | POST | Retrain model |
| `/docs` | GET | API documentation |

## Pipeline Explained (Simple Version)

```
User Message (any language)
    ↓
Detect Language (English, Hindi, Urdu)
    ↓
Translate to English (if needed)
    ↓
Classify Intent (GREETING, PRICE, ORDER, etc.)
    ↓
Extract Entities (product, quantity)
    ↓
Generate Response
    ↓
Bot Reply + Quick Actions
```

## Typical Response Example

```json
{
  "user_message": "2 kg rice chahiye",      // Original user input
  "language": "Hindi",                       // Detected language
  "translated_text": "I want 2 kg rice",    // English translation
  "intent": "ORDER",                         // What user wants
  "confidence": 0.95,                        // How confident (0-1)
  "entities": {                              // What user is ordering
    "product": "rice",
    "quantity": 2.0
  },
  "reply": "Great! I can process...",        // Bot's response
  "quick_replies": [...]                     // Quick action buttons
}
```

## Integration with Frontend (Next.js)

Add this to your frontend:

```typescript
// lib/chatbot-api.ts
export async function sendToChatbot(message: string) {
  const response = await fetch('http://localhost:8000/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  });

  return response.json();
}
```

Use in component:

```typescript
// components/ChatWidget.tsx
'use client';

import { sendToChatbot } from '@/lib/chatbot-api';
import { useState } from 'react';

export default function ChatWidget() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    setLoading(true);
    const result = await sendToChatbot(message);
    setResponse(result);
    setLoading(false);
    setMessage('');
  };

  return (
    <div className="p-4 border rounded-lg">
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type message..."
        className="w-full px-4 py-2 border rounded mb-2"
      />
      <button onClick={handleSend} disabled={loading}>
        {loading ? 'Processing...' : 'Send'}
      </button>

      {response && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <p><strong>Bot:</strong> {response.reply}</p>
          <p><strong>Intent:</strong> {response.intent}</p>
          <p><strong>Product:</strong> {response.entities.product}</p>
          <div className="mt-2 flex gap-2">
            {response.quick_replies.map((reply) => (
              <button key={reply} className="px-3 py-1 bg-blue-600 text-white rounded text-sm">
                {reply}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

## Troubleshooting

**Q: Models take long to load first time**
- A: Normal! Hugging Face models download on first run. Subsequent requests are fast.

**Q: Port 8000 already in use**
- A: Change port: `uvicorn routes:app --port 8001`

**Q: "ModuleNotFoundError" for transformers**
- A: Run: `pip install -r requirements.txt` again

**Q: Low accuracy on intent**
- A: Add more training data to `data/training_data.csv` then call `/train`

## Next Steps

1. ✅ Run chatbot locally
2. ✅ Test with sample messages
3. ✅ Integrate with frontend (see example above)
4. ✅ Connect to WhatsApp API
5. ✅ Deploy to production

## File Structure

```
chatbot-engine/
├── app/
│   ├── main.py              # Main orchestrator
│   ├── routes.py            # FastAPI endpoints
│   ├── services/
│   │   ├── language.py      # Language detection
│   │   ├── translation.py   # Translation
│   │   ├── intent.py        # Intent classification
│   │   ├── entity.py        # Entity extraction
│   │   └── response.py      # Response generation
│   └── models/
│       └── intent_model.pkl # ML model
├── data/
│   └── training_data.csv    # Training examples
├── requirements.txt         # Dependencies
├── README.md               # Full documentation
├── TESTING_GUIDE.md        # Test examples
└── QUICK_START.md          # This file
```

## Ready to Go!

Your chatbot is now:
- ✅ Running on `http://localhost:8000`
- ✅ Processing multi-language inputs
- ✅ Classifying intents accurately
- ✅ Extracting entities
- ✅ Generating contextual responses
- ✅ Ready to integrate with frontend

Happy chatting!

---

**Need help?** Check `README.md` for detailed documentation or `TESTING_GUIDE.md` for more examples.

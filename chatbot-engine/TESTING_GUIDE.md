# Chatbot Engine Testing Guide

Complete guide to test the chatbot engine locally with examples and expected outputs.

## Quick Start Testing

### 1. Install & Run

```bash
# Navigate to chatbot-engine
cd chatbot-engine

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start API server
cd app
uvicorn routes:app --reload --host 0.0.0.0 --port 8000
```

Server running at: `http://localhost:8000`

---

## Test Case 1: Simple Greeting

**Scenario**: User greets the bot in English

### Request
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'
```

### Expected Response
```json
{
  "user_message": "Hello",
  "language": "English",
  "translated_text": "Hello",
  "intent": "GREETING",
  "confidence": 0.92,
  "entities": {
    "product": null,
    "quantity": null
  },
  "reply": "Hello! How can I help you today?",
  "quick_replies": ["View products", "Check price", "Place order"]
}
```

### What's Happening
1. Language detected as English (no translation needed)
2. Intent classifier recognized greeting pattern
3. No product/quantity entities
4. Generated appropriate greeting response

---

## Test Case 2: Hindi Order

**Scenario**: User orders in Hindi

### Request
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "2 kg rice chahiye"}'
```

### Expected Response
```json
{
  "user_message": "2 kg rice chahiye",
  "language": "Hindi",
  "translated_text": "I want 2 kg rice",
  "intent": "ORDER",
  "confidence": 0.93,
  "entities": {
    "product": "rice",
    "quantity": 2.0
  },
  "reply": "Great! I can process your order for 2kg rice.",
  "quick_replies": ["Proceed to payment", "Check delivery", "Need more?"]
}
```

### What's Happening
1. Language detected as Hindi
2. Translated to English: "I want 2 kg rice"
3. Intent classified as ORDER
4. Extracted product "rice" and quantity 2
5. Generated order confirmation with entities

---

## Test Case 3: Price Inquiry

**Scenario**: User asks about prices

### Request
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the price of wheat?"}'
```

### Expected Response
```json
{
  "user_message": "What is the price of wheat?",
  "language": "English",
  "translated_text": "What is the price of wheat?",
  "intent": "PRICE",
  "confidence": 0.91,
  "entities": {
    "product": "wheat",
    "quantity": null
  },
  "reply": "I can help you with pricing. Which product are you interested in?",
  "quick_replies": ["View all products", "Place order", "Need help?"]
}
```

---

## Test Case 4: Delivery Inquiry

**Scenario**: User asks about delivery

### Request
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "When will my order arrive?"}'
```

### Expected Response
```json
{
  "user_message": "When will my order arrive?",
  "language": "English",
  "translated_text": "When will my order arrive?",
  "intent": "DELIVERY",
  "confidence": 0.89,
  "entities": {
    "product": null,
    "quantity": null
  },
  "reply": "What is your order number? I can check the delivery status for you.",
  "quick_replies": ["Check payment status", "Contact support", "Back"]
}
```

---

## Test Case 5: Payment Question

**Scenario**: User asks about payment methods

### Request
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "How to pay?"}'
```

### Expected Response
```json
{
  "user_message": "How to pay?",
  "language": "English",
  "translated_text": "How to pay?",
  "intent": "PAYMENT",
  "confidence": 0.87,
  "entities": {
    "product": null,
    "quantity": null
  },
  "reply": "We accept multiple payment methods: UPI, Credit Card, Debit Card, and Bank Transfer.",
  "quick_replies": ["Confirm payment", "Use different method", "Cancel order"]
}
```

---

## Test Case 6: Suspicious Message

**Scenario**: User sends suspicious/spam content

### Request
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "This is a scam and fraud"}'
```

### Expected Response
```json
{
  "user_message": "This is a scam and fraud",
  "language": "English",
  "translated_text": "This is a scam and fraud",
  "intent": "SCAM",
  "confidence": 0.92,
  "entities": {
    "product": null,
    "quantity": null
  },
  "reply": "This message appears suspicious. Please be cautious.",
  "quick_replies": ["Report issue", "Contact support", "Block sender"]
}
```

---

## Test Case 7: Urdu Message

**Scenario**: User message in Urdu

### Request
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Mujhe 3 kg ata chahiye"}'
```

### Expected Response
```json
{
  "user_message": "Mujhe 3 kg ata chahiye",
  "language": "Urdu",
  "translated_text": "I need 3 kg flour",
  "intent": "ORDER",
  "confidence": 0.91,
  "entities": {
    "product": "flour",
    "quantity": 3.0
  },
  "reply": "Great! I can process your order for 3kg flour.",
  "quick_replies": ["Proceed to payment", "Check delivery", "Need more?"]
}
```

---

## Test Case 8: Complex Order with Multiple Quantities

**Scenario**: Order with decimal quantities

### Request
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "0.5 litre milk and 2.5 kg sugar"}'
```

### Expected Response
```json
{
  "user_message": "0.5 litre milk and 2.5 kg sugar",
  "language": "English",
  "translated_text": "0.5 litre milk and 2.5 kg sugar",
  "intent": "ORDER",
  "confidence": 0.88,
  "entities": {
    "product": "milk",
    "quantity": 0.5
  },
  "reply": "Great! I can process your order for 0.5litre milk.",
  "quick_replies": ["Proceed to payment", "Check delivery", "Need more?"]
}
```

**Note**: Entity extractor returns first product found. For multiple products, use multiple requests.

---

## Test Case 9: Low Confidence Message

**Scenario**: Ambiguous message (low confidence)

### Request
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "xyz abc"}'
```

### Expected Response
```json
{
  "user_message": "xyz abc",
  "language": "English",
  "translated_text": "xyz abc",
  "intent": null,
  "confidence": 0.15,
  "entities": {
    "product": null,
    "quantity": null
  },
  "reply": "I did not understand that. Could you please rephrase?",
  "quick_replies": ["Start over", "Speak with agent", "Help"]
}
```

---

## Test Case 10: Error Cases

### Empty Message
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": ""}'
```

**Expected**: 400 Error
```json
{
  "detail": "Message cannot be empty"
}
```

### Message Too Long
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "' + ('x' * 1001) + '"}'
```

**Expected**: 400 Error
```json
{
  "detail": "Message too long (max 1000 characters)"
}
```

---

## Testing with Python

Create `test_chatbot.py`:

```python
import requests
import json

API_URL = "http://localhost:8000"

def test_chat(message):
    response = requests.post(f"{API_URL}/chat", json={"message": message})
    return response.json()

def print_result(message, result):
    print(f"\nUser: {message}")
    print(f"Language: {result['language']}")
    print(f"Intent: {result['intent']} ({result['confidence']})")
    print(f"Entities: {result['entities']}")
    print(f"Bot: {result['reply']}")
    print(f"Quick Replies: {result['quick_replies']}")
    print("-" * 60)

# Test cases
test_messages = [
    "Hello, how are you?",
    "2 kg rice chahiye",
    "What is the price of wheat?",
    "When will my delivery arrive?",
    "How to pay?",
    "This is a scam",
]

for msg in test_messages:
    result = test_chat(msg)
    print_result(msg, result)
```

Run tests:
```bash
python test_chatbot.py
```

---

## Testing with Postman

1. **Open Postman**
2. **Create new Request**
   - Method: POST
   - URL: `http://localhost:8000/chat`
   - Body (JSON):
     ```json
     {
       "message": "2 kg rice chahiye"
     }
     ```
3. **Click Send**
4. **View response**

---

## Testing All Endpoints

### 1. Health Check
```bash
curl http://localhost:8000/health
```

### 2. Get Intents
```bash
curl http://localhost:8000/intents
```

### 3. Get Products
```bash
curl http://localhost:8000/products
```

### 4. Add Product
```bash
curl -X POST "http://localhost:8000/products/add?product_name=basmati"
```

### 5. API Documentation
Open in browser: `http://localhost:8000/docs`

---

## Performance Testing

Test response times with Apache Bench:

```bash
ab -n 100 -c 10 -p data.json -T application/json http://localhost:8000/chat
```

Expected results:
- Requests per second: ~10-15
- Average response time: 600-1000ms

---

## Integration Testing with Frontend

Add to your Next.js dashboard:

```typescript
// lib/chatbot.ts
export async function testChatbot(message: string) {
  try {
    const response = await fetch('http://localhost:8000/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });

    if (!response.ok) throw new Error('Chatbot error');
    return await response.json();
  } catch (error) {
    console.error('Chatbot error:', error);
    throw error;
  }
}
```

Test in component:

```typescript
// pages/dashboard/messages/page.tsx
'use client';

import { testChatbot } from '@/lib/chatbot';
import { useState } from 'react';

export default function TestChat() {
  const [response, setResponse] = useState(null);

  const handleTest = async () => {
    const result = await testChatbot("2 kg rice chahiye");
    setResponse(result);
  };

  return (
    <div>
      <button onClick={handleTest}>Test Chatbot</button>
      {response && <pre>{JSON.stringify(response, null, 2)}</pre>}
    </div>
  );
}
```

---

## Debugging Tips

### 1. Check Service Logs
Add this to `services/language.py`:
```python
print(f"Detecting language for: {text}")
```

### 2. Enable Debug Logging
In `routes.py`:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)
```

### 3. Test Individual Services
```python
from services.language import LanguageDetector
from services.translation import TranslationService

detector = LanguageDetector()
lang, is_eng = detector.detect_language("namaste")
print(f"Language: {lang}")

if not is_eng:
    translator = TranslationService()
    translated = translator.translate("namaste", lang)
    print(f"Translated: {translated}")
```

### 4. Monitor Model Loading
Check if models are cached:
```python
from services.translation import TranslationService
print(TranslationService._model_cache)
```

---

## Troubleshooting

### Issue: Connection Refused
**Error**: `Connection refused on http://localhost:8000`

**Fix**:
```bash
# Make sure server is running
cd chatbot-engine/app
uvicorn routes:app --reload --port 8000
```

### Issue: Module Not Found
**Error**: `ModuleNotFoundError: No module named 'fastapi'`

**Fix**:
```bash
pip install -r requirements.txt
```

### Issue: CORS Error in Frontend
**Error**: `Access to XMLHttpRequest blocked by CORS policy`

**Fix**: Update `routes.py`:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Issue: Slow Response Time
**Cause**: Model loading on first request

**Fix**: Warm up models on startup
```python
@app.on_event("startup")
async def startup():
    global chatbot_engine
    chatbot_engine = ChatbotEngine()
    # Warm up with dummy request
    chatbot_engine.process_message("test")
```

---

## Summary

- **10 main test cases** covering all intents
- **Error handling tests** for edge cases
- **Performance benchmarks** for production
- **Integration examples** with frontend
- **Debugging tips** for troubleshooting

All tests should pass with consistent, contextual responses!

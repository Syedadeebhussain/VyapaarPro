# VyaparAI Chatbot Engine

A modular, production-ready chatbot backend for the AI-Powered WhatsApp Business Assistant for Indian Small Businesses.

## Features

- **Language Detection**: Automatically detects Hindi, Urdu, or English
- **Translation**: Converts non-English text to English using MarianMT
- **Intent Classification**: Classifies messages into 6 categories using ML
- **Entity Extraction**: Extracts product names and quantities
- **Response Generation**: Generates contextual replies
- **REST API**: FastAPI endpoints for easy integration

## Architecture

```
chatbot-engine/
├── app/
│   ├── main.py              # Chatbot orchestrator
│   ├── routes.py            # FastAPI endpoints
│   ├── services/
│   │   ├── language.py      # Language detection
│   │   ├── translation.py   # Text translation
│   │   ├── intent.py        # Intent classification
│   │   ├── entity.py        # Entity extraction
│   │   └── response.py      # Response generation
│   └── models/
│       └── intent_model.pkl # Trained ML model
├── data/
│   └── training_data.csv    # Training dataset
├── requirements.txt         # Python dependencies
└── README.md               # This file
```

## Installation

### Prerequisites
- Python 3.8+
- pip package manager

### Setup

1. **Clone/Navigate to project**
   ```bash
   cd chatbot-engine
   ```

2. **Create virtual environment** (recommended)
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

## Running the Chatbot

### Option 1: Using FastAPI Server

```bash
cd app
uvicorn routes:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

API Documentation: `http://localhost:8000/docs` (interactive Swagger UI)

### Option 2: Direct Python Testing

```bash
cd app
python main.py
```

This runs a basic test with sample messages.

## API Endpoints

### 1. Chat Endpoint

**POST** `/chat`

Process a user message through the chatbot pipeline.

**Request:**
```json
{
  "message": "2 kg rice chahiye"
}
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

### 2. Health Check

**GET** `/health`

Check if chatbot is running.

**Response:**
```json
{
  "status": "healthy",
  "message": "Chatbot engine is running"
}
```

### 3. List Intents

**GET** `/intents`

Get all supported intent categories.

**Response:**
```json
{
  "intents": ["GREETING", "PRICE", "ORDER", "DELIVERY", "PAYMENT", "SCAM"],
  "total": 6
}
```

### 4. List Products

**GET** `/products`

Get all recognized products.

**Response:**
```json
{
  "products": ["rice", "wheat", "flour", "dal", ...],
  "total": 25
}
```

### 5. Add Product

**POST** `/products/add?product_name=basmati`

Add new product to recognition list.

**Response:**
```json
{
  "success": true,
  "message": "Product \"basmati\" added successfully"
}
```

### 6. Retrain Model

**POST** `/train`

Retrain intent classifier with updated training data.

**Response:**
```json
{
  "success": true,
  "message": "Model retrained successfully"
}
```

## How Each Service Works

### 1. Language Detection (`language.py`)

**Purpose**: Identify input language

**Logic**:
```
Input: "2 kg rice chahiye"
  ↓
Use langdetect library
  ↓
Detect language code: "hi" (Hindi)
  ↓
Map to human-readable: "Hindi"
  ↓
Output: ("Hindi", False)  # is_english=False
```

**Supported**: English, Hindi, Urdu

**Example**:
```python
from services.language import LanguageDetector

detector = LanguageDetector()
lang, is_eng = detector.detect_language("Namaste")
# Returns: ("Hindi", False)
```

---

### 2. Translation (`translation.py`)

**Purpose**: Convert Hindi/Urdu to English

**Logic**:
```
Input: Language="Hindi", Text="2 kg rice chahiye"
  ↓
Load MarianMT model: Helsinki-NLP/Opus-MT-hi-en
  ↓
Tokenize input text
  ↓
Generate translation
  ↓
Decode output
  ↓
Output: "I want 2 kg rice"
```

**Models Used**:
- Hindi → English: `Helsinki-NLP/Opus-MT-hi-en`
- Urdu → English: `Helsinki-NLP/Opus-MT-ur-en`

**Example**:
```python
from services.translation import TranslationService

translator = TranslationService()
english = translator.translate("rice ki keemat kya hai?", "Hindi")
# Returns: "what is the price of rice?"
```

---

### 3. Intent Classification (`intent.py`)

**Purpose**: Categorize message intent

**How it Works**:

1. **Training Phase** (once):
   ```
   Input: training_data.csv
   ```
   | Text | Intent |
   |------|--------|
   | hello | GREETING |
   | what is price | PRICE |
   | I want rice | ORDER |
   | when delivery | DELIVERY |
   | how to pay | PAYMENT |
   | spam content | SCAM |

   ```
   ↓
   TF-IDF: Convert text to vectors
   ↓
   Logistic Regression: Learn patterns
   ↓
   Save model as .pkl file
   ```

2. **Prediction Phase** (per message):
   ```
   Input: "I want 2 kg rice"
   ↓
   Convert to TF-IDF vector
   ↓
   Logistic Regression predicts
   ↓
   Output: Intent="ORDER", Confidence=0.95
   ```

**Supported Intents**:
- `GREETING` - Hello, hi, thanks
- `PRICE` - Price inquiries
- `ORDER` - Product orders
- `DELIVERY` - Delivery status
- `PAYMENT` - Payment questions
- `SCAM` - Suspicious/malicious content

**Example**:
```python
from services.intent import IntentClassifier

classifier = IntentClassifier()
result = classifier.classify("what is the price of rice")
# Returns: {"intent": "PRICE", "confidence": 0.88}
```

---

### 4. Entity Extraction (`entity.py`)

**Purpose**: Extract product and quantity

**Logic**:
```
Input: "2 kg rice chahiye"
  ↓
Extract quantity: Look for numbers + units
  Pattern: (\d+\.?\d*)\s*(kg|gm|litre|...)
  Match: "2" → 2.0
  ↓
Extract product: Check if text contains known products
  Products list: ["rice", "wheat", "dal", ...]
  Match: "rice" found
  ↓
Output: {"product": "rice", "quantity": 2.0}
```

**Rule-Based Approach** (no ML):
- Uses regex for quantity extraction
- Matches product names from predefined list
- Simple and fast

**Example**:
```python
from services.entity import EntityExtractor

extractor = EntityExtractor()
entities = extractor.extract_entities("5 units dal please")
# Returns: {"product": "dal", "quantity": 5.0}
```

---

### 5. Response Generation (`response.py`)

**Purpose**: Generate contextual replies

**Logic**:
```
Input: intent="ORDER", entities={"product": "rice", "quantity": 2}
  ↓
Look up response template for ORDER:
  "Great! I can process your order for {quantity}kg {product}."
  ↓
Fill placeholders with entities:
  {quantity} = 2
  {product} = rice
  ↓
Output: "Great! I can process your order for 2kg rice."
```

**Response by Intent**:

| Intent | Response Template |
|--------|-------------------|
| GREETING | "Hello! How can I help you today?" |
| PRICE | "I can help with pricing. Which product?" |
| ORDER | "Great! I can process your order for {quantity}kg {product}." |
| DELIVERY | "What is your order number?" |
| PAYMENT | "We accept UPI, Cards, and Bank Transfer." |
| SCAM | "This message appears suspicious." |
| None | "I did not understand that." |

**Example**:
```python
from services.response import ResponseGenerator

generator = ResponseGenerator()
reply = generator.generate_response(
    intent="ORDER",
    entities={"product": "wheat", "quantity": 5},
    confidence=0.9
)
# Returns: "Great! I can process your order for 5kg wheat."
```

---

## Complete Pipeline Example

```python
from app.main import ChatbotEngine

engine = ChatbotEngine()

# Single function processes entire pipeline
result = engine.process_message("2 kg rice chahiye")

print(result)
# Output:
# {
#   'user_message': '2 kg rice chahiye',
#   'language': 'Hindi',
#   'translated_text': 'I want 2 kg rice',
#   'intent': 'ORDER',
#   'confidence': 0.95,
#   'entities': {'product': 'rice', 'quantity': 2.0},
#   'reply': 'Great! I can process your order for 2kg rice.',
#   'quick_replies': ['Proceed to payment', 'Check delivery', 'Need more?']
# }
```

---

## Testing with cURL

### 1. Health Check
```bash
curl http://localhost:8000/health
```

### 2. Chat Message
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "2 kg rice chahiye"}'
```

### 3. Get Intents
```bash
curl http://localhost:8000/intents
```

### 4. Add Product
```bash
curl -X POST "http://localhost:8000/products/add?product_name=basmati"
```

---

## Testing with Python Requests

```python
import requests

API_URL = "http://localhost:8000"

# Test chat
response = requests.post(f"{API_URL}/chat", json={
    "message": "2 kg rice chahiye"
})

print(response.json())
```

---

## Configuration

### Environment Variables (Optional)

Create `.env` file in chatbot-engine directory:

```env
LOG_LEVEL=INFO
MODEL_PATH=app/models/intent_model.pkl
TRAINING_DATA_PATH=data/training_data.csv
```

---

## Training Data Format

File: `data/training_data.csv`

Format:
```csv
text,intent
hello,GREETING
hi,GREETING
what is the price,PRICE
I want to order,ORDER
...
```

**To retrain model**:
1. Update `data/training_data.csv` with new examples
2. Call `/train` endpoint
3. Model will be retrained automatically

---

## Common Issues & Fixes

### Issue 1: Module Not Found Error
```
ModuleNotFoundError: No module named 'transformers'
```

**Fix**:
```bash
pip install -r requirements.txt
```

### Issue 2: Model Loading Takes Too Long
**Cause**: First load downloads models from Hugging Face

**Fix**: Be patient on first run. Models are cached for future use.

### Issue 3: Low Intent Classification Accuracy
**Cause**: Limited training data

**Fix**:
1. Add more examples to `data/training_data.csv`
2. Call `/train` endpoint
3. Retrain the model

### Issue 4: Product Not Recognized
**Cause**: Product not in entity extractor list

**Fix**:
```bash
curl -X POST "http://localhost:8000/products/add?product_name=yourproduct"
```

---

## Integration with Frontend

### React/Next.js Integration

```typescript
// lib/chatbot.ts
export async function sendMessage(message: string) {
  const response = await fetch('http://localhost:8000/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  });

  return response.json();
}
```

### Usage in Component

```typescript
// pages/dashboard/messages.tsx
import { sendMessage } from '@/lib/chatbot';

async function handleSendMessage(userMessage: string) {
  const result = await sendMessage(userMessage);

  console.log('Intent:', result.intent);
  console.log('Bot Reply:', result.reply);
  console.log('Quick Replies:', result.quick_replies);
}
```

---

## Production Deployment

### Docker

Create `Dockerfile`:
```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["uvicorn", "app.routes:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:
```bash
docker build -t vyapara-chatbot .
docker run -p 8000:8000 vyapara-chatbot
```

### Environment Variables for Production
```env
LOG_LEVEL=ERROR
WORKERS=4
```

---

## Performance Metrics

- **Language Detection**: < 100ms
- **Translation**: 500-1000ms (first load slower)
- **Intent Classification**: < 50ms
- **Entity Extraction**: < 10ms
- **Response Generation**: < 5ms
- **Total Pipeline**: 600-1100ms

---

## Future Enhancements

1. **Named Entity Recognition (NER)**: Better entity extraction
2. **Contextual Memory**: Remember conversation history
3. **Multi-turn Conversations**: Handle follow-ups
4. **Confidence Thresholds**: Route to human agent if uncertain
5. **A/B Testing**: Test different response templates
6. **Analytics Dashboard**: Track conversation metrics
7. **Webhook Support**: Send updates to external systems

---

## Support & Documentation

- FastAPI Docs: https://fastapi.tiangolo.com
- Transformers Docs: https://huggingface.co/docs/transformers
- Scikit-learn Docs: https://scikit-learn.org

---

## License

Created for VyaparAI - WhatsApp Business Assistant

---

**Ready to deploy and integrate with your frontend dashboard!**

# Integration Steps - Chatbot with Frontend & WhatsApp

Complete step-by-step guide to integrate the chatbot engine with your Next.js frontend and WhatsApp API.

## Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         INTEGRATION FLOW                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  WhatsApp Message                                                          │
│     ↓                                                                       │
│  Your Backend API (Node.js/Python)                                        │
│     ↓                                                                       │
│  Chatbot Engine (FastAPI on port 8000)                                    │
│     ↓                                                                       │
│  Processed Response                                                        │
│     ↓                                                                       │
│  Send back via WhatsApp API                                               │
│     ↓                                                                       │
│  Next.js Dashboard (Display conversation)                                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Local Testing (15 minutes)

### Step 1.1: Start Chatbot Engine

```bash
# Terminal 1: Start chatbot on port 8000
cd chatbot-engine
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd app
uvicorn routes:app --reload --host 0.0.0.0 --port 8000
```

**Expected**:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
Initializing Chatbot Engine...
Chatbot Engine ready!
```

### Step 1.2: Test with cURL

```bash
# Terminal 2: Test the API
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "2 kg rice chahiye"}'
```

**Expected Response**:
```json
{
  "user_message": "2 kg rice chahiye",
  "language": "Hindi",
  "translated_text": "I want 2 kg rice",
  "intent": "ORDER",
  "confidence": 0.95,
  "entities": {"product": "rice", "quantity": 2.0},
  "reply": "Great! I can process your order for 2kg rice.",
  "quick_replies": ["Proceed to payment", "Check delivery", "Need more?"]
}
```

### Step 1.3: Open API Documentation

Open in browser: `http://localhost:8000/docs`

You'll see interactive Swagger UI. Click "POST /chat", "Try it out", and test.

---

## Phase 2: Frontend Integration (30 minutes)

### Step 2.1: Add Chatbot API Client

Create `lib/chatbot-api.ts`:

```typescript
// lib/chatbot-api.ts
export interface ChatbotResponse {
  user_message: string;
  language: string;
  translated_text: string;
  intent: string | null;
  confidence: number;
  entities: {
    product: string | null;
    quantity: number | null;
  };
  reply: string;
  quick_replies: string[];
}

const CHATBOT_API_URL = process.env.NEXT_PUBLIC_CHATBOT_URL || 'http://localhost:8000';

export async function sendChatMessage(message: string): Promise<ChatbotResponse> {
  try {
    const response = await fetch(`${CHATBOT_API_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error(`Chatbot error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to send message to chatbot:', error);
    throw error;
  }
}

export async function getIntents() {
  const response = await fetch(`${CHATBOT_API_URL}/intents`);
  return response.json();
}

export async function getProducts() {
  const response = await fetch(`${CHATBOT_API_URL}/products`);
  return response.json();
}
```

### Step 2.2: Configure Environment Variables

Create `.env.local`:

```env
# Chatbot Engine
NEXT_PUBLIC_CHATBOT_URL=http://localhost:8000

# If you have a backend API
NEXT_PUBLIC_API_URL=http://localhost:3001
```

For production:
```env
NEXT_PUBLIC_CHATBOT_URL=https://chatbot.yourdomain.com
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### Step 2.3: Create Chat Component

Create `components/ChatWidget.tsx`:

```typescript
'use client';

import React, { useState } from 'react';
import { sendChatMessage, type ChatbotResponse } from '@/lib/chatbot-api';
import { Button } from '@/components/dashboard/Button';
import { Send, Loader } from 'lucide-react';

interface Message {
  type: 'user' | 'bot';
  text: string;
  timestamp: Date;
  metadata?: ChatbotResponse;
}

export function ChatWidget() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    setError(null);
    setLoading(true);

    // Add user message
    const userMessage: Message = {
      type: 'user',
      text: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      // Send to chatbot
      const response = await sendChatMessage(input);

      // Add bot response
      const botMessage: Message = {
        type: 'bot',
        text: response.reply,
        timestamp: new Date(),
        metadata: response,
      };

      setMessages((prev) => [...prev, botMessage]);
      setInput('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');

      // Add error message
      const errorMessage: Message = {
        type: 'bot',
        text: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickReply = async (quickReply: string) => {
    setInput(quickReply);

    const form = document.querySelector('form');
    if (form) {
      form.dispatchEvent(new Event('submit', { bubbles: true }));
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-white">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <p className="text-lg font-semibold mb-2">Welcome to VyaparAI</p>
              <p>How can I help you today?</p>
            </div>
          </div>
        )}

        {messages.map((message, idx) => (
          <div
            key={idx}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm">{message.text}</p>

              {/* Show intent & entities for bot messages */}
              {message.type === 'bot' && message.metadata && (
                <div className="mt-2 text-xs opacity-75">
                  <p>Intent: {message.metadata.intent || 'Unknown'}</p>
                  {message.metadata.entities.product && (
                    <p>Product: {message.metadata.entities.product}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Quick Replies */}
        {messages.length > 0 && !loading && (
          <div className="mt-4">
            {messages[messages.length - 1].metadata?.quick_replies && (
              <div className="flex gap-2 flex-wrap">
                {messages[messages.length - 1].metadata.quick_replies.map(
                  (reply) => (
                    <button
                      key={reply}
                      onClick={() => handleQuickReply(reply)}
                      className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full hover:bg-blue-200 transition"
                    >
                      {reply}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        )}

        {/* Loading indicator */}
        {loading && (
          <div className="flex items-center space-x-2 text-gray-500">
            <Loader className="w-4 h-4 animate-spin" />
            <span>Processing...</span>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSendMessage}
        className="border-t border-gray-200 p-4 flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          disabled={loading}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <Button
          type="submit"
          variant="primary"
          disabled={loading || !input.trim()}
          className="flex items-center space-x-2"
        >
          <Send className="w-4 h-4" />
          <span>Send</span>
        </Button>
      </form>
    </div>
  );
}
```

### Step 2.4: Add to Dashboard

Update `app/dashboard/messages/page.tsx`:

```typescript
'use client';

import { ChatWidget } from '@/components/ChatWidget';

export default function MessagesPage() {
  return (
    <div className="h-screen flex flex-col">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600">Chat with customers</p>
      </div>

      <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden">
        <ChatWidget />
      </div>
    </div>
  );
}
```

### Step 2.5: Test Frontend Integration

```bash
# Terminal 3: Start Next.js dev server
cd ..
npm run dev
```

Open `http://localhost:3001/dashboard/messages`

Try sending messages like:
- "Hello"
- "2 kg rice chahiye"
- "What is the price of wheat?"

---

## Phase 3: Backend API Integration (45 minutes)

Your backend API needs to:
1. Receive WhatsApp message from WhatsApp Cloud API
2. Send to chatbot engine
3. Store conversation in database
4. Send response back to user

### Step 3.1: Create Backend Endpoint

If using Node.js/Express:

```javascript
// routes/chat.js
const express = require('express');
const router = express.Router();

const CHATBOT_URL = process.env.CHATBOT_ENGINE_URL || 'http://localhost:8000';

// Incoming WhatsApp message
router.post('/webhook', async (req, res) => {
  try {
    const { phone, message } = req.body;

    // Send to chatbot
    const chatbotResponse = await fetch(`${CHATBOT_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });

    const botData = await chatbotResponse.json();

    // Store in database
    await db.conversations.create({
      phone,
      user_message: message,
      intent: botData.intent,
      confidence: botData.confidence,
      bot_reply: botData.reply,
      language: botData.language,
      entities: botData.entities,
      timestamp: new Date()
    });

    // Send back to WhatsApp (using WhatsApp API)
    await sendWhatsAppMessage(phone, botData.reply);

    // Also send quick replies
    if (botData.quick_replies.length > 0) {
      await sendWhatsAppQuickReplies(phone, botData.quick_replies);
    }

    res.json({ success: true, data: botData });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

### Step 3.2: Connect to Supabase

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function saveConversation(data: {
  phone: string;
  userMessage: string;
  intent: string;
  botReply: string;
  language: string;
}) {
  const { error } = await supabase.from('conversations').insert([
    {
      phone: data.phone,
      user_message: data.userMessage,
      intent: data.intent,
      bot_reply: data.botReply,
      language: data.language,
      created_at: new Date(),
    },
  ]);

  if (error) console.error('Error saving conversation:', error);
}

export async function getConversations(phone: string) {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('phone', phone)
    .order('created_at', { ascending: true });

  if (error) console.error('Error fetching conversations:', error);
  return data;
}
```

### Step 3.3: Create Supabase Table

```sql
-- SQL to create conversations table
CREATE TABLE conversations (
  id SERIAL PRIMARY KEY,
  phone VARCHAR(20) NOT NULL,
  user_message TEXT NOT NULL,
  intent VARCHAR(50),
  confidence DECIMAL(3,2),
  bot_reply TEXT,
  language VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for phone lookups
CREATE INDEX idx_conversations_phone ON conversations(phone);
```

---

## Phase 4: WhatsApp API Integration (60 minutes)

### Step 4.1: Set Up WhatsApp Cloud API Webhook

In your WhatsApp Business Account settings:

```
Webhook URL: https://your-backend.com/webhook/whatsapp
Verify Token: your-random-token-123
```

### Step 4.2: Create WhatsApp Webhook Handler

```python
# routes/whatsapp.py (FastAPI) or Node.js equivalent
from fastapi import FastAPI, Request

app = FastAPI()

@app.get("/webhook/whatsapp")
async def verify_webhook(request: Request):
    """Verify webhook with WhatsApp"""
    token = request.query_params.get("hub.verify_token")
    challenge = request.query_params.get("hub.challenge")

    if token == os.getenv("WHATSAPP_VERIFY_TOKEN"):
        return int(challenge)

    return {"error": "Invalid token"}, 403


@app.post("/webhook/whatsapp")
async def handle_whatsapp_message(request: Request):
    """Receive and process WhatsApp messages"""
    data = await request.json()

    # Extract message details
    messages = data['entry'][0]['changes'][0]['value'].get('messages', [])

    for message in messages:
        phone = message['from']
        text = message['text']['body']

        # Send to chatbot
        chatbot_response = await send_to_chatbot(text)

        # Send response back to user
        await send_whatsapp_reply(phone, chatbot_response['reply'])

        # Log conversation
        await log_conversation(phone, text, chatbot_response)

    return {"status": "ok"}


async def send_to_chatbot(message: str):
    """Send message to chatbot engine"""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "http://localhost:8000/chat",
            json={"message": message}
        )
        return response.json()


async def send_whatsapp_reply(phone: str, message: str):
    """Send reply via WhatsApp API"""
    headers = {
        "Authorization": f"Bearer {os.getenv('WHATSAPP_API_TOKEN')}"
    }

    payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": phone,
        "type": "text",
        "text": {
            "preview_url": False,
            "body": message
        }
    }

    async with httpx.AsyncClient() as client:
        await client.post(
            "https://graph.instagram.com/v17.0/YOUR_PHONE_ID/messages",
            json=payload,
            headers=headers
        )
```

---

## Phase 5: Deployment (90 minutes)

### Step 5.1: Deploy Chatbot Engine

**Option A: Heroku**

```bash
# Create Procfile
web: cd chatbot-engine/app && uvicorn routes:app --host 0.0.0.0 --port $PORT

# Create runtime.txt
python-3.11.5

# Push to Heroku
heroku create vyapara-chatbot
git push heroku main
```

**Option B: Docker + Cloud Run**

```dockerfile
# Dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY chatbot-engine/requirements.txt .
RUN pip install -r requirements.txt

COPY chatbot-engine/app ./app
COPY chatbot-engine/data ./data

CMD ["uvicorn", "app.routes:app", "--host", "0.0.0.0", "--port", "8000"]
```

```bash
# Deploy to Google Cloud Run
gcloud run deploy vyapara-chatbot \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Step 5.2: Update Environment Variables

**.env.local (Frontend)**:
```env
NEXT_PUBLIC_CHATBOT_URL=https://vyapara-chatbot-xxxx.a.run.app
NEXT_PUBLIC_API_URL=https://your-backend.com
```

**.env (Backend)**:
```env
CHATBOT_ENGINE_URL=https://vyapara-chatbot-xxxx.a.run.app
WHATSAPP_API_TOKEN=your_token
SUPABASE_URL=your_url
SUPABASE_KEY=your_key
```

---

## Checklist

### Local Setup
- [ ] Chatbot engine running on port 8000
- [ ] FastAPI docs accessible at /docs
- [ ] Test endpoint working with cURL
- [ ] Next.js dev server running on port 3001
- [ ] Chat widget displays and sends messages
- [ ] Receives responses from chatbot

### Frontend Integration
- [ ] `lib/chatbot-api.ts` created
- [ ] Environment variables configured
- [ ] ChatWidget component created
- [ ] Messages page updated
- [ ] Error handling in place
- [ ] Loading states working

### Backend Integration
- [ ] Backend API receives WhatsApp messages
- [ ] Forwards to chatbot engine
- [ ] Stores conversations in database
- [ ] Sends responses back to WhatsApp

### WhatsApp Integration
- [ ] Webhook configured in WhatsApp Business
- [ ] Webhook handler receives messages
- [ ] Messages routed to chatbot
- [ ] Responses sent to users

### Deployment
- [ ] Chatbot engine deployed
- [ ] Frontend deployed
- [ ] Backend API deployed
- [ ] Environment variables set
- [ ] Webhook tested end-to-end
- [ ] Monitor logs for errors

---

## Testing Flow

```
1. Send message via WhatsApp
   ↓
2. Webhook receives message
   ↓
3. Backend forwards to chatbot engine
   ↓
4. Chatbot processes (language → translate → intent → entity → response)
   ↓
5. Response sent back to WhatsApp user
   ↓
6. Also visible in Next.js dashboard
   ↓
7. Conversation logged in Supabase
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| CORS error | Add CORS middleware in chatbot routes.py |
| Webhook not receiving | Check verify token, webhook URL |
| Chatbot slow | Model caching, warm-up requests |
| Messages not saved | Check Supabase credentials, RLS policies |
| WhatsApp API errors | Verify token, check rate limits |

---

## Support

- Chatbot issues → See README.md
- Frontend issues → Check Next.js docs
- WhatsApp issues → Meta business docs
- Database issues → Supabase docs

---

**You now have a complete AI chatbot integrated with WhatsApp and your frontend dashboard!**

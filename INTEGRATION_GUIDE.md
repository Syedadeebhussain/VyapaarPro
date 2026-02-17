# Backend API Integration Guide

## Quick Start

### 1. Environment Setup

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 2. API Endpoints Overview

Your backend should provide these endpoints:

| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| GET | `/messages` | Fetch all WhatsApp messages | Array of messages |
| GET | `/orders` | Fetch all orders | Array of orders |
| POST | `/orders` | Create new order | Created order object |
| GET | `/products` | Fetch all products | Array of products |
| POST | `/products` | Add new product | Created product object |
| PUT | `/products/:id` | Update product | Updated product object |
| DELETE | `/products/:id` | Delete product | Success message |
| GET | `/analytics/summary` | Get dashboard stats | Summary object |

---

## Detailed Endpoint Specifications

### 1. Messages Endpoint

**Endpoint**: `GET /messages`

**Request**:
```bash
curl -X GET http://localhost:3000/messages \
  -H "Content-Type: application/json"
```

**Response** (200 OK):
```json
[
  {
    "id": "1",
    "customerNumber": "+91 98765 43210",
    "message": "Hi, I want to order 2 units of wireless headphones",
    "time": "2 hours ago",
    "status": "unread"
  },
  {
    "id": "2",
    "customerNumber": "+91 87654 32109",
    "message": "What is the price of smart watch?",
    "time": "3 hours ago",
    "status": "replied"
  }
]
```

**Field Descriptions**:
- `id` (string): Unique message identifier
- `customerNumber` (string): Customer's phone number with country code
- `message` (string): Message content
- `time` (string): Human-readable time (e.g., "2 hours ago")
- `status` (enum): One of `"read"`, `"unread"`, `"replied"`

---

### 2. Orders Endpoint

**Endpoint**: `GET /orders`

**Response** (200 OK):
```json
[
  {
    "orderId": "#12345",
    "customer": "Rajesh Kumar",
    "product": "Wireless Headphones",
    "amount": "₹2,499",
    "status": "Paid"
  }
]
```

**Field Descriptions**:
- `orderId` (string): Unique order ID with # prefix
- `customer` (string): Customer name
- `product` (string): Product name
- `amount` (string): Price with currency symbol
- `status` (enum): One of `"Paid"`, `"Pending"`

---

### 3. Products Endpoints

#### Get All Products
**Endpoint**: `GET /products`

**Response** (200 OK):
```json
[
  {
    "id": "1",
    "name": "Wireless Headphones",
    "price": "₹2,499",
    "stock": 45
  }
]
```

#### Create Product
**Endpoint**: `POST /products`

**Request Body**:
```json
{
  "name": "New Product",
  "price": "₹1,999",
  "stock": 100
}
```

**Response** (201 Created):
```json
{
  "id": "5",
  "name": "New Product",
  "price": "₹1,999",
  "stock": 100,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

#### Update Product
**Endpoint**: `PUT /products/:id`

**Request Body**:
```json
{
  "name": "Updated Product",
  "price": "₹2,499",
  "stock": 75
}
```

#### Delete Product
**Endpoint**: `DELETE /products/:id`

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

### 4. Analytics Summary

**Endpoint**: `GET /analytics/summary`

**Response** (200 OK):
```json
{
  "totalOrders": 1245,
  "totalRevenue": 245678,
  "totalMessages": 3456,
  "activeCustomers": 892,
  "revenueData": [
    { "month": "Jan", "revenue": 15000 },
    { "month": "Feb", "revenue": 18000 }
  ]
}
```

---

## Sample Backend Implementation

### Node.js + Express Example

```javascript
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Messages endpoint
app.get('/messages', (req, res) => {
  const messages = [
    {
      id: '1',
      customerNumber: '+91 98765 43210',
      message: 'Hi, I want to order 2 units of wireless headphones',
      time: '2 hours ago',
      status: 'unread'
    }
  ];
  res.json(messages);
});

// Orders endpoint
app.get('/orders', (req, res) => {
  const orders = [
    {
      orderId: '#12345',
      customer: 'Rajesh Kumar',
      product: 'Wireless Headphones',
      amount: '₹2,499',
      status: 'Paid'
    }
  ];
  res.json(orders);
});

// Products endpoints
app.get('/products', (req, res) => {
  // Fetch from database
  res.json(products);
});

app.post('/products', (req, res) => {
  const { name, price, stock } = req.body;
  // Save to database
  res.status(201).json({ id: newId, name, price, stock });
});

app.listen(3000, () => {
  console.log('API running on port 3000');
});
```

---

## Authentication Integration

### Option 1: JWT Token

Modify `lib/api.ts`:

```typescript
async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const token = localStorage.getItem('authToken');

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      ...options?.headers,
    },
  });

  if (response.status === 401) {
    localStorage.removeItem('authToken');
    window.location.href = '/';
    return;
  }

  return await response.json();
}
```

### Option 2: Session-based Auth

```typescript
async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: 'include', // Send cookies
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  return await response.json();
}
```

---

## Error Handling

### Frontend (Already Implemented)

The `api.ts` utility includes error handling:

```typescript
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}
```

### Backend Example

```javascript
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: true,
    message: err.message || 'Internal Server Error'
  });
});
```

---

## CORS Configuration

### Express.js

```javascript
const cors = require('cors');

app.use(cors({
  origin: ['http://localhost:3001', 'https://yourdomain.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
```

### Nginx

```nginx
location /api {
  add_header 'Access-Control-Allow-Origin' '*';
  add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
  add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization';
}
```

---

## Testing Your API

### Using cURL

```bash
# Test messages endpoint
curl http://localhost:3000/messages

# Test with authentication
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3000/messages

# Test POST request
curl -X POST http://localhost:3000/products \
     -H "Content-Type: application/json" \
     -d '{"name":"Test Product","price":"₹999","stock":50}'
```

### Using Postman

1. Import the following collection:
   - Base URL: `http://localhost:3000`
   - Endpoints: `/messages`, `/orders`, `/products`
2. Test each endpoint
3. Verify response format matches specifications

---

## Database Schema Recommendations

### Messages Table
```sql
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  customer_number VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'unread',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Orders Table
```sql
CREATE TABLE orders (
  order_id VARCHAR(20) PRIMARY KEY,
  customer_name VARCHAR(100) NOT NULL,
  product_name VARCHAR(200) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Products Table
```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  stock INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## Real-time Updates (WebSocket)

For live message updates, consider implementing WebSocket:

```typescript
// In your message component
useEffect(() => {
  const ws = new WebSocket('ws://localhost:3000/messages');

  ws.onmessage = (event) => {
    const newMessage = JSON.parse(event.data);
    setMessages(prev => [newMessage, ...prev]);
  };

  return () => ws.close();
}, []);
```

---

## Production Checklist

- [ ] Set correct API_BASE_URL in production
- [ ] Enable HTTPS for API endpoints
- [ ] Implement proper authentication
- [ ] Add rate limiting
- [ ] Set up logging and monitoring
- [ ] Configure CORS for production domain
- [ ] Add input validation on backend
- [ ] Implement database connection pooling
- [ ] Add API response caching
- [ ] Set up error tracking (Sentry, etc.)

---

## Troubleshooting

### Issue: CORS Error
**Solution**: Configure CORS on your backend to allow requests from frontend domain

### Issue: 404 Not Found
**Solution**: Verify API endpoint URLs match between frontend and backend

### Issue: Network Error
**Solution**: Check if backend server is running and accessible

### Issue: Unauthorized (401)
**Solution**: Verify authentication token is being sent correctly

---

## Support Resources

- Express.js Docs: https://expressjs.com
- Next.js API Routes: https://nextjs.org/docs/api-routes/introduction
- CORS Guide: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS

---

**Happy Coding!**

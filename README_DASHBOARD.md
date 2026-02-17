# VyaparAI - WhatsApp Business Assistant Dashboard

A professional SaaS dashboard built with Next.js, TypeScript, and Tailwind CSS for managing AI-powered WhatsApp business operations for Indian small businesses.

## Features

- **Authentication**: Clean login page with email/password authentication
- **Dashboard**: Overview with summary cards and revenue charts
- **Messages**: Real-time WhatsApp message management with API integration
- **Orders**: Complete order management system with status tracking
- **Products**: Product inventory management with add/edit/delete functionality
- **Payments**: Payment tracking module (placeholder)
- **Analytics**: Business analytics and insights (placeholder)
- **Fully Responsive**: Mobile-first design that works on all devices

## Tech Stack

- **Framework**: Next.js 13 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom reusable components
- **Icons**: Lucide React

## Project Structure

```
frontend/
├── app/
│   ├── page.tsx                      # Login page (landing page)
│   ├── layout.tsx                    # Root layout
│   └── dashboard/
│       ├── layout.tsx                # Dashboard layout with sidebar
│       ├── page.tsx                  # Dashboard home
│       ├── messages/
│       │   └── page.tsx              # Messages page with API integration
│       ├── orders/
│       │   └── page.tsx              # Orders management
│       ├── products/
│       │   └── page.tsx              # Product management with forms
│       ├── payments/
│       │   └── page.tsx              # Payments module
│       └── analytics/
│           └── page.tsx              # Analytics module
├── components/
│   └── dashboard/
│       ├── Button.tsx                # Reusable button component
│       ├── Card.tsx                  # Summary card component
│       ├── Table.tsx                 # Data table component
│       ├── Sidebar.tsx               # Navigation sidebar
│       ├── Navbar.tsx                # Top navigation bar
│       └── DashboardLayout.tsx       # Main dashboard layout
└── lib/
    ├── utils.ts                      # Utility functions
    └── api.ts                        # API integration utilities
```

## Installation & Setup

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Open in Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

4. **Build for Production**
   ```bash
   npm run build
   npm start
   ```

## API Integration Guide

### Messages API

The Messages page (`/dashboard/messages`) fetches data from your backend API.

**Endpoint**: `GET http://localhost:3000/messages`

**Expected Response Format**:
```json
[
  {
    "id": "1",
    "customerNumber": "+91 98765 43210",
    "message": "Hi, I want to order 2 units of wireless headphones",
    "time": "2 hours ago",
    "status": "unread"
  }
]
```

**Status Values**: `"read"`, `"unread"`, `"replied"`

### How to Connect Your Backend

1. **Update API Base URL**

   Edit `lib/api.ts`:
   ```typescript
   const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
   ```

   Or set environment variable:
   ```bash
   NEXT_PUBLIC_API_URL=http://your-backend-api.com
   ```

2. **Configure Environment Variables**

   Create `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

3. **Add Authentication Headers**

   Modify `lib/api.ts` to include auth tokens:
   ```typescript
   headers: {
     'Content-Type': 'application/json',
     'Authorization': `Bearer ${yourToken}`,
     ...options?.headers,
   }
   ```

4. **Handle CORS**

   Ensure your backend allows requests from your frontend:
   ```javascript
   // Express.js example
   app.use(cors({
     origin: 'http://localhost:3001',
     credentials: true
   }));
   ```

### Backend API Endpoints to Implement

```
GET    /messages          - Fetch all messages
GET    /orders            - Fetch all orders
POST   /orders            - Create new order
GET    /products          - Fetch all products
POST   /products          - Create new product
PUT    /products/:id      - Update product
DELETE /products/:id      - Delete product
GET    /analytics/summary - Fetch dashboard summary
```

## Component Usage

### Button Component
```tsx
import { Button } from '@/components/dashboard/Button';

<Button variant="primary" size="md" onClick={handleClick}>
  Click Me
</Button>
```

**Variants**: `primary`, `secondary`, `outline`, `danger`
**Sizes**: `sm`, `md`, `lg`

### Card Component
```tsx
import { Card } from '@/components/dashboard/Card';
import { ShoppingCart } from 'lucide-react';

<Card
  title="Total Orders"
  value="1,245"
  icon={ShoppingCart}
  trend="+12.5% from last month"
  trendUp={true}
/>
```

### Table Component
```tsx
import { Table } from '@/components/dashboard/Table';

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  {
    key: 'status',
    label: 'Status',
    render: (value) => <span className="badge">{value}</span>
  }
];

<Table columns={columns} data={data} />
```

## Responsive Design

All components are fully responsive with breakpoints:
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Key Responsive Features:
- Collapsible sidebar on mobile
- Hamburger menu for navigation
- Responsive grid layouts
- Mobile-optimized forms and tables

## Authentication Flow

1. User lands on login page (`/`)
2. Enters email and password
3. On successful login, redirects to `/dashboard`
4. Logout button returns to login page

**Note**: Currently uses simulated authentication. Integrate with your auth provider:
- Firebase Auth
- NextAuth.js
- Custom JWT authentication
- Supabase Auth

## Customization

### Change Branding

Edit `components/dashboard/Sidebar.tsx`:
```tsx
<span className="text-xl font-bold">YourBrandName</span>
```

### Update Color Scheme

Modify `tailwind.config.ts` for custom colors:
```typescript
colors: {
  primary: {
    DEFAULT: '#3b82f6', // Change this
  }
}
```

### Add New Pages

1. Create new page in `app/dashboard/yourpage/page.tsx`
2. Add route to `components/dashboard/Sidebar.tsx`:
```tsx
{ icon: YourIcon, label: 'Your Page', href: '/dashboard/yourpage' }
```

## Sample Data

All pages include sample data for demonstration. Replace with actual API calls:

- **Dashboard**: Static summary cards and revenue data
- **Messages**: Fallback sample messages if API fails
- **Orders**: Pre-populated order list
- **Products**: Initial product inventory

## Deployment

### Vercel (Recommended)
```bash
vercel deploy
```

### Netlify
Already configured with `netlify.toml`

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

## Troubleshooting

### API Connection Issues
- Check if backend server is running
- Verify CORS configuration
- Check API endpoint URLs in `lib/api.ts`
- Look for errors in browser console

### Build Errors
- Clear `.next` folder: `rm -rf .next`
- Delete `node_modules`: `rm -rf node_modules`
- Reinstall: `npm install`
- Rebuild: `npm run build`

### Styling Issues
- Clear Tailwind cache
- Restart dev server
- Check for conflicting CSS classes

## Next Steps

1. **Backend Integration**: Connect with your WhatsApp Business API backend
2. **Authentication**: Implement proper user authentication
3. **Real-time Updates**: Add WebSocket for live message updates
4. **Database**: Connect to Supabase/PostgreSQL for data persistence
5. **Payment Gateway**: Integrate Razorpay/Stripe for payment processing
6. **Analytics**: Add charts using Recharts or Chart.js
7. **Notifications**: Implement push notifications
8. **Export Features**: Add CSV/PDF export functionality

## Support

For questions or issues:
- Review the code documentation
- Check Next.js documentation: [nextjs.org](https://nextjs.org)
- Tailwind CSS: [tailwindcss.com](https://tailwindcss.com)

## License

This project is created for VyaparAI - WhatsApp Business Assistant.

---

**Built with Next.js, TypeScript, and Tailwind CSS**
**Designed for Indian Small Businesses**

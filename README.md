# Subscription Management System

A full-stack web application for managing subscription-based products, recurring billing, invoicing, payments, taxes, discounts, and reports.

## Tech Stack

- **Frontend**: React + Vite, React Router, Axios, Recharts
- **Backend**: Node.js, Express.js, JWT Authentication
- **Database**: MongoDB + Mongoose

## Project Structure

```
├── client/          # React frontend (Person 2 & 3)
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page-level components
│   │   ├── services/     # API service layer
│   │   ├── context/      # React Context (auth)
│   │   └── utils/        # Helpers
│   └── package.json
│
├── server/          # Express backend (Person 1)
│   ├── config/      # Database config
│   ├── controllers/ # Route handlers
│   ├── middleware/   # Auth & role guards
│   ├── models/      # Mongoose schemas
│   ├── routes/      # API routes
│   ├── utils/       # Token & email helpers
│   └── package.json
```

## Quick Start

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)

### 1. Clone & Install

```bash
# Clone the repo
git clone <your-repo-url>
cd "Subscription Management System"

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure Environment

```bash
# In the server/ folder, create .env from the template
cd server
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

### 3. Run Development Servers

```bash
# Terminal 1 - Start backend (port 5000)
cd server
npm run dev

# Terminal 2 - Start frontend (port 3000)
cd client
npm run dev
```

### 4. Open in Browser
Visit `http://localhost:3000`

## API Endpoints

| Module | Endpoints |
|--------|-----------|
| Auth | POST `/api/auth/register`, `/api/auth/login`, `/api/auth/forgot-password` |
| Products | GET/POST `/api/products`, GET/PUT/DELETE `/api/products/:id` |
| Plans | GET/POST `/api/plans`, GET/PUT/DELETE `/api/plans/:id` |
| Subscriptions | GET/POST `/api/subscriptions`, PUT `/api/subscriptions/:id/status` |
| Invoices | GET/POST `/api/invoices`, PUT `/api/invoices/:id/status` |
| Payments | GET/POST `/api/payments` |
| Discounts | GET/POST `/api/discounts`, GET/PUT/DELETE `/api/discounts/:id` |
| Taxes | GET/POST `/api/taxes`, GET/PUT/DELETE `/api/taxes/:id` |
| Users | GET/POST `/api/users`, GET/PUT/DELETE `/api/users/:id` |
| Reports | GET `/api/reports/dashboard`, `/api/reports/revenue`, `/api/reports/subscriptions` |

## Team

- **Person 1 (Backend)**: APIs, database, business logic
- **Person 2 (Frontend)**: UI pages, components, design
- **Person 3 (Full-Stack)**: Quotation templates, reports, integration, testing

# Subscription Management System — Technology Stack & Team Division

## Technology Stack (Best-in-Class for a Hackathon)

### Frontend
| Technology | Purpose |
|---|---|
| **React.js** (with Vite) | Fast, component-based UI framework |
| **React Router** | Client-side routing & navigation |
| **Vanilla CSS** (with CSS Variables) | Custom design system, dark mode, animations |
| **Chart.js** / **Recharts** | Dashboard charts & analytics |
| **React-Toastify** | Notifications & toast messages |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js** + **Express.js** | REST API server |
| **JWT** (jsonwebtoken) | Authentication & role-based access |
| **bcryptjs** | Password hashing |
| **Nodemailer** | Password reset emails |
| **express-validator** | Input validation |

### Database
| Technology | Purpose |
|---|---|
| **MongoDB** + **Mongoose** | NoSQL document database, flexible schema |

### Dev Tools
| Technology | Purpose |
|---|---|
| **Git / GitHub** | Version control & collaboration |
| **Postman** | API testing |
| **dotenv** | Environment variable management |
| **nodemon** | Auto-restart dev server |

---

## Why This Stack?

1. **Speed**: React + Vite gives blazing-fast HMR. Express is minimal and quick to set up.
2. **Hackathon-friendly**: MongoDB needs no migrations; Mongoose schemas are easy to define.
3. **Full JavaScript**: One language across frontend + backend — easier for a 3-person team.
4. **Production-ready patterns**: JWT auth, role-based access, RESTful APIs.

---

## Team Division (3 People)

### 👤 Person 1 — **Backend Developer** (API & Business Logic)
**Owns:** Server, database, and all business logic.

| Module | Tasks |
|---|---|
| **Setup** | Express server, MongoDB connection, folder structure, `.env` config |
| **Auth** | Signup, Login, Password Reset APIs; JWT middleware; role-based guards |
| **Products** | CRUD APIs for products & variants |
| **Recurring Plans** | CRUD APIs with billing period logic |
| **Subscriptions** | Create, update, status transitions (Draft→Active→Closed) |
| **Invoices** | Auto-generate from subscriptions, status flow, tax/discount calc |
| **Payments** | Record payments, link to invoices |
| **Taxes & Discounts** | CRUD APIs, auto-apply logic during invoicing |
| **Reports API** | Aggregation queries for revenue, active subs, overdue invoices |

**Key files/folders:** `server/`, `models/`, `routes/`, `controllers/`, `middleware/`

---

### 👤 Person 2 — **Frontend Developer** (UI & Integration)
**Owns:** All pages, components, API integration, and routing.

| Module | Tasks |
|---|---|
| **Design System** | CSS variables, dark theme, global styles, responsive layout |
| **Auth Pages** | Login, Signup, Reset Password forms with validation |
| **Dashboard** | Summary cards, charts (Chart.js), recent activity |
| **Navigation** | Sidebar with role-based menu items |
| **Products Pages** | List, Create, Edit, Delete views + variant management |
| **Plans Pages** | List, Create, Edit with billing period selectors |
| **Subscriptions** | List, Create (with order lines), status badges, detail view |
| **Invoices** | List, Detail, Print/PDF view |
| **Payments** | Record payment form, payment history |
| **Discounts & Taxes** | CRUD forms & list views |
| **Users/Contacts** | Admin user management page |

**Key files/folders:** `client/src/pages/`, `client/src/components/`, `client/src/services/`

---

### 👤 Person 3 — **Full-Stack + Integration Lead**
**Owns:** Quotation templates, reports UI, testing, deployment, and gap-filling.

| Module | Tasks |
|---|---|
| **Quotation Templates** | Backend CRUD + Frontend pages |
| **Reports Module** | Frontend charts & filters; work with Person 1 on aggregation APIs |
| **API Integration** | Connect frontend services (`axios`) to backend endpoints |
| **State Management** | React Context for auth state, user role, notifications |
| **Email Service** | Integrate Nodemailer for password reset & invoice sending |
| **Testing** | API testing with Postman; end-to-end flow testing |
| **Documentation** | README, API docs, setup guide |
| **Deployment** | Deploy frontend (Vercel/Netlify) + backend (Render/Railway) |

**Key files/folders:** Works across `client/` and `server/`

---

## Project Structure (Monorepo)

```
Subscription Management System/
├── client/                      # React + Vite frontend
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/               # Page-level components
│   │   ├── services/            # Axios API calls
│   │   ├── context/             # React Context (auth, theme)
│   │   ├── utils/               # Helpers, validators
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
│
├── server/                      # Node.js + Express backend
│   ├── config/                  # DB connection, env config
│   ├── controllers/             # Route handler logic
│   ├── middleware/               # Auth, role-based guards
│   ├── models/                  # Mongoose schemas
│   ├── routes/                  # Express route definitions
│   ├── utils/                   # Email, helpers
│   ├── server.js
│   └── package.json
│
├── .gitignore
├── README.md
└── package.json                 # Root scripts (optional)
```

---

## Timeline Suggestion (2–3 Day Hackathon)

| Day | Person 1 (Backend) | Person 2 (Frontend) | Person 3 (Full-Stack) |
|---|---|---|---|
| **Day 1** | Setup, Auth, Products, Plans APIs | Design system, Auth pages, Dashboard, Navigation | Quotation APIs, State mgmt, Axios service layer |
| **Day 2** | Subscriptions, Invoices, Payments APIs | Products, Plans, Subscriptions, Invoices pages | Reports module, API integration, Email service |
| **Day 3** | Tax/Discount logic, Reports API, bug fixes | Discounts, Taxes, Users pages, polish | Testing, deployment, documentation |

---

## Verification Plan

### Automated / Tool-Based Testing
- **Postman Collection**: Person 3 will create and export a Postman collection to test every API endpoint
- **Browser Testing**: Navigate through the full app flow (signup → login → create product → create plan → create subscription → generate invoice → record payment → view reports)

### Manual Verification
1. **Auth flow**: Register → Login → Access dashboard → Logout → Try accessing protected route (should redirect)
2. **Role-based access**: Login as Admin vs Internal User vs Portal User — verify menu items and API access differ
3. **Subscription lifecycle**: Create Draft → Convert to Quotation → Confirm → Activate → Close
4. **Invoice generation**: Confirm a subscription → verify invoice is auto-generated with correct tax/discount
5. **Payment recording**: Record a payment against an invoice → verify invoice status changes to Paid
6. **Reports**: Verify dashboard charts show correct counts and revenue figures

# AssetFlow Enterprise Asset Management System

A modern, production-grade 3-tier Enterprise Asset Management (EAM) platform with AI-powered predictive health scoring and real-time lifecycle tracking.

---

## 🏗️ Architecture Overview

The system is organized into a clean, decoupled 3-tier enterprise architecture:

```
EDI_Project/
├── backend/            # Node.js + Express + TypeScript REST API & Prisma ORM
│   ├── src/            # Controllers, Services, Routes, Middlewares, Validations
│   ├── prisma/         # Schema & database seed scripts (Supabase PostgreSQL)
│   └── tests/          # Comprehensive API & Health prediction test suites
├── frontend/           # React 18 + Vite + TypeScript Single Page Application
│   ├── src/            # Components, Pages, Contexts, Hooks, Services
│   └── public/         # Static assets and icons
└── ml-service/         # Python FastAPI Machine Learning Microservice
    ├── app/            # FastAPI endpoints and prediction pipelines
    ├── model/          # Trained Random Forest & Calibrated Classifiers
    ├── training/       # Training, evaluation & synthetic data generation
    └── data/           # Dataset files (CSV & Excel)
```

---

## 🌟 Key Features

- **🔐 Enterprise Authentication**: JWT-based authentication with bcrypt password hashing and token expiration.
- **🛡️ Role-Based Access Control (RBAC)**: Role validation (`ADMIN`, `MANAGER`, `EMPLOYEE`).
- **🤖 AI Asset Health & Failure Risk Prediction**: Multi-factor machine learning pipeline predicting asset health scores, risk categories, failure probabilities, and degrading factors.
- **💻 Asset Lifecycle Tracking**: Full tracking of assets from procurement to decommission (`AVAILABLE`, `ASSIGNED`, `UNDER_MAINTENANCE`, `DAMAGED`, `LOST`, `RETIRED`).
- **📋 Asset Assignment & Custody**: Atomic assignment checkouts and check-in return workflows.
- **🔧 Maintenance & Servicing Management**: Scheduled and corrective servicing logs with automated asset status sync.
- **📝 Incident Reporting**: Damage, loss, and issue filing with resolution workflows.
- **👥 User & Role Management**: Search, department filtering, profile management, and account deactivation.
- **📊 Real-time Dashboard Analytics**: Aggregated KPIs in Indian Rupees (₹), category breakdowns, status distribution, maintenance costs, and recent activities.
- **📜 Immutable Audit Trail**: Automatic audit logging for every security and operational event.
- **🛡️ Validation & Error Handling**: Zod request schema validation and centralized error formatting.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Recharts
- **Backend**: Node.js, Express.js, TypeScript, Prisma ORM, PostgreSQL (Supabase)
- **ML Service**: Python 3.12, FastAPI, Scikit-learn, Pandas, NumPy, Joblib, OpenPyXL
- **Security**: Helmet, CORS, JWT, bcryptjs, Zod
- **Logging**: Morgan HTTP logger & Custom Audit Logger

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18.0.0 or higher)
- Python (v3.10+ recommended for ML service)
- npm or yarn

### 2. Installation & Quick Start
```bash
# Install root dependencies
npm install

# Install & run Backend
npm run backend:dev

# Run Frontend (Vite)
npm run frontend:dev

# Run ML Microservice (FastAPI)
cd ml-service
pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

### 3. Environment Variables
Configure `.env` in the root directory:
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL="http://localhost:3000,http://localhost:5173"

JWT_SECRET="your-secure-jwt-secret-key"
JWT_EXPIRES_IN="7d"

SUPABASE_URL="https://hssqdqtjajrmpjsprtth.supabase.co"
SUPABASE_PUBLISHABLE_KEY="sb_publishable_LW2iDYdRdl5WWOes0stMbA_BpLgaGXB"

# Supabase PostgreSQL connection pooler (Port 5432 session mode):
DATABASE_URL="postgresql://postgres.hssqdqtjajrmpjsprtth:YOUR_DB_PASSWORD@aws-0-ap-south-1.pooler.supabase.com:5432/postgres"
```

### 4. Database Setup & Seeding
```bash
# Push Prisma schema to Supabase PostgreSQL
npm run prisma:push

# Populate realistic demo users, assets, assignments, maintenance, and audit logs
npm run prisma:seed
```

### 5. Running the Backend Server
```bash
# Development mode with hot-reloading:
npm run dev

# Production build:
npm run build
npm start
```

---

## 🔑 Demo Login Credentials

The seed script initializes 10 users with the default password `Password@123`:

| Role | Name | Email | Password |
| :--- | :--- | :--- | :--- |
| **👑 ADMIN** | System Admin | `admin@assetflow.com` | `Password@123` |
| **💼 MANAGER** | Operations Manager | `manager@assetflow.com` | `Password@123` |
| **💼 MANAGER** | Claire Beauchamp (Finance) | `claire.beauchamp@assetflow.com` | `Password@123` |
| **🧑 EMPLOYEE** | Standard Employee | `employee@assetflow.com` | `Password@123` |
| **🧑 EMPLOYEE** | Devon Patel (Engineering) | `devon.patel@assetflow.com` | `Password@123` |

---

## 📡 API Reference

All protected endpoints require the HTTP header:
`Authorization: Bearer <your_jwt_token>`

### 🩺 Health Check
- `GET /api/health` — Check server status & uptime

---

### 🔐 Authentication (`/api/auth`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register a new user |
| `POST` | `/api/auth/login` | Public | Login with email & password to receive JWT |
| `GET` | `/api/auth/me` | Authenticated | Get current authenticated user profile & active assignments |

#### Sample Login Request
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@assetflow.com","password":"Password@123"}'
```

#### Sample Response
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "23a1a9e7-578a-4467-9aa2-fa32c74d610c",
      "name": "System Admin",
      "email": "admin@assetflow.com",
      "role": "ADMIN",
      "department": "Executive Administration",
      "status": "ACTIVE"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 💻 Assets Management (`/api/assets`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/assets` | Authenticated | List assets with search, category, status, and pagination |
| `GET` | `/api/assets/:id` | Authenticated | Get detailed asset information including history |
| `POST` | `/api/assets` | Admin, Manager | Create a new asset |
| `PUT` | `/api/assets/:id` | Admin, Manager | Update asset details |
| `DELETE` | `/api/assets/:id` | Admin | Delete asset (prevented if assigned) |

#### Query Parameters for `GET /api/assets`:
- `search`: Search across name, assetTag, serialNumber, model, manufacturer
- `status`: Filter by `AVAILABLE`, `ASSIGNED`, `UNDER_MAINTENANCE`, `DAMAGED`, `LOST`, `RETIRED`
- `category`: Filter by category (e.g. `Laptop`, `Desktop`, `Monitor`, `Mobile`, `Printer`, `Networking`, `Furniture`)
- `location`: Filter by location string
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `sortBy`: Field to sort (`createdAt`, `name`, `assetTag`, `purchasePrice`)
- `sortOrder`: `asc` or `desc`

---

### 📋 Asset Assignments (`/api/assignments`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/assignments` | Admin, Manager | Assign asset to user (Asset status ➔ `ASSIGNED`) |
| `GET` | `/api/assignments` | Authenticated | List assignment history and active loans |
| `GET` | `/api/assignments/:id` | Authenticated | Get assignment details |
| `PUT` | `/api/assignments/:id/return` | Admin, Manager | Return assigned asset (Asset status ➔ `AVAILABLE`) |

---

### 🔧 Maintenance (`/api/maintenance`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/maintenance` | Admin, Manager | Schedule maintenance (Asset status ➔ `UNDER_MAINTENANCE`) |
| `GET` | `/api/maintenance` | Authenticated | List maintenance records with status/type filters |
| `GET` | `/api/maintenance/:id` | Authenticated | Get maintenance record details |
| `PUT` | `/api/maintenance/:id` | Admin, Manager | Update maintenance (Completing sets Asset status ➔ `AVAILABLE`) |
| `DELETE` | `/api/maintenance/:id` | Admin | Delete maintenance record |

---

### 📝 Incident & Damage Reports (`/api/reports`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/reports` | Authenticated (All) | Submit report (`DAMAGE`, `LOSS`, `ISSUE`) |
| `GET` | `/api/reports` | Authenticated | List all incident reports |
| `GET` | `/api/reports/:id` | Authenticated | Get report details |
| `PUT` | `/api/reports/:id` | Admin, Manager | Resolve or update report (`RESOLVED`, `REJECTED`, `UNDER_REVIEW`) |

---

### 📊 Dashboard & Analytics (`/api/dashboard`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard/stats` | Authenticated | Full dashboard KPIs, category distributions, status charts, costs, and recent activities |

#### Sample Dashboard Response
```json
{
  "success": true,
  "message": "Dashboard statistics retrieved successfully",
  "data": {
    "summary": {
      "totalAssets": 20,
      "availableAssets": 9,
      "assignedAssets": 8,
      "maintenanceAssets": 1,
      "damagedAssets": 1,
      "lostAssets": 0,
      "totalUsers": 10,
      "activeAssignments": 8,
      "pendingReports": 2,
      "totalMaintenanceCost": "850.00"
    },
    "charts": {
      "assetsByCategory": [
        { "category": "Laptop", "count": 4 },
        { "category": "Networking", "count": 3 },
        { "category": "Furniture", "count": 3 }
      ],
      "assetsByStatus": [
        { "status": "AVAILABLE", "count": 9 },
        { "status": "ASSIGNED", "count": 8 }
      ]
    },
    "recentActivities": [...]
  }
}
```

---

### 👥 User Management (`/api/users`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users` | Admin, Manager | List users with search, role, and department filters |
| `GET` | `/api/users/:id` | Authenticated | Get user profile and assigned assets |
| `POST` | `/api/users` | Admin | Create a new user with role & department |
| `PUT` | `/api/users/:id` | Admin | Update user details / change status |
| `DELETE` | `/api/users/:id` | Admin | Deactivate/Delete user |

---

### 🛡️ Audit Logs (`/api/audit-logs`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/audit-logs` | Admin | Retrieve immutable system audit trail |

---

## 📁 Project Structure

```
d:/main/clg/EDI/EDI_Project/
├── src/
│   ├── config/
│   │   └── env.ts                     # Validated configuration values
│   ├── lib/
│   │   └── prisma.ts                  # Global PrismaClient instance
│   ├── middleware/
│   │   ├── auth.middleware.ts         # JWT Bearer verification
│   │   ├── error.middleware.ts        # Centralized HTTP error handler
│   │   ├── role.middleware.ts         # Role-based authorization guard
│   │   └── validation.middleware.ts   # Zod request validation
│   ├── validations/
│   │   ├── asset.validation.ts        # Asset schema rules
│   │   ├── assignment.validation.ts   # Assignment schema rules
│   │   ├── auth.validation.ts         # Auth register & login schemas
│   │   ├── maintenance.validation.ts  # Maintenance schema rules
│   │   ├── report.validation.ts       # Incident reporting schemas
│   │   └── user.validation.ts         # User management schemas
│   ├── services/
│   │   ├── asset.service.ts           # Asset CRUD & query business logic
│   │   ├── assignment.service.ts      # Assignment & return state machine
│   │   ├── audit.service.ts           # Automatic audit trail writer
│   │   ├── auth.service.ts            # Password verification & token signing
│   │   ├── dashboard.service.ts       # Aggregations & chart statistics
│   │   ├── maintenance.service.ts     # Servicing lifecycle logic
│   │   ├── report.service.ts          # Incident resolution workflows
│   │   └── user.service.ts            # User CRUD & department filtering
│   ├── controllers/
│   │   ├── asset.controller.ts
│   │   ├── assignment.controller.ts
│   │   ├── audit.controller.ts
│   │   ├── auth.controller.ts
│   │   ├── dashboard.controller.ts
│   │   ├── maintenance.controller.ts
│   │   ├── report.controller.ts
│   │   └── user.controller.ts
│   ├── routes/
│   │   ├── asset.routes.ts
│   │   ├── assignment.routes.ts
│   │   ├── audit.routes.ts
│   │   ├── auth.routes.ts
│   │   ├── dashboard.routes.ts
│   │   ├── index.ts
│   │   ├── maintenance.routes.ts
│   │   ├── report.routes.ts
│   │   └── user.routes.ts
│   ├── utils/
│   │   ├── apiResponse.ts             # Standardized API response formatter
│   │   └── jwt.ts                     # JWT signing & verification helper
│   ├── app.ts                         # Express application setup
│   └── server.ts                      # Server entry point
├── prisma/
│   ├── schema.prisma                  # PostgreSQL database schema
│   └── seed.ts                        # Realistic seed database script
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

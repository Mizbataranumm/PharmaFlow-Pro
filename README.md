# PharmaFlow – Medicine Inventory Alert Dashboard

A production-ready web application for small clinic staff to manage medicine inventory, track expiry dates, and get alerts for low stock and expired medicines.

---

## Tech Stack

| Layer    | Technology                  |
|----------|-----------------------------|
| Frontend | React 18, Tailwind CSS, React Router, Axios, Lucide Icons |
| Backend  | Node.js, Express.js         |
| Database | MongoDB with Mongoose       |
| Auth     | JWT (JSON Web Tokens) + bcrypt |

---

## Project Structure

```
pharmaflow/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js          # MongoDB connection
│   │   │   └── seed.js        # Sample data seeder
│   │   ├── middleware/
│   │   │   └── auth.js        # JWT protect middleware
│   │   ├── models/
│   │   │   ├── Medicine.js    # Medicine schema + virtuals
│   │   │   └── User.js        # User schema + bcrypt
│   │   ├── routes/
│   │   │   ├── auth.js        # POST /login, GET /me
│   │   │   ├── medicines.js   # Full CRUD
│   │   │   └── dashboard.js   # Summary + alerts
│   │   └── index.js           # Express server entry
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── Sidebar.jsx        # Navigation sidebar
    │   │   ├── StatusBadge.jsx    # Color-coded status pill
    │   │   ├── MedicineForm.jsx   # Add/edit modal form
    │   │   └── ConfirmDialog.jsx  # Delete confirmation
    │   ├── hooks/
    │   │   └── useAuth.js         # Auth context + hook
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── DashboardPage.jsx
    │   │   ├── InventoryPage.jsx
    │   │   ├── AlertsPage.jsx
    │   │   └── ReorderPage.jsx
    │   ├── services/
    │   │   └── api.js             # Axios instance + all API calls
    │   ├── utils/
    │   │   └── status.js          # Status logic + helpers
    │   ├── App.jsx
    │   ├── index.js
    │   └── index.css
    ├── tailwind.config.js
    ├── .env
    └── package.json
```

---

## Prerequisites

- **Node.js** v18+ — https://nodejs.org
- **MongoDB** — https://www.mongodb.com/try/download/community (local install)
- **npm** v9+

---

## Step-by-Step Setup

### 1. Install & Start MongoDB locally

**macOS (Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Windows:**
Download and install MongoDB Community Server from https://www.mongodb.com/try/download/community
Then start via Services or run: `mongod`

**Ubuntu/Debian:**
```bash
sudo apt install mongodb
sudo systemctl start mongod
```

Verify MongoDB is running:
```bash
mongosh   # opens MongoDB shell — type exit to quit
```

---

### 2. Setup the Backend

```bash
# Navigate to backend directory
cd pharmaflow/backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# (Optional) Edit .env if your MongoDB is on a different port/host
# Default: MONGODB_URI=mongodb://localhost:27017/pharmaflow

# Seed the database with sample medicines + users
npm run seed

# Start the development server
npm run dev
```

The API will be running at: **http://localhost:5000**

Test it:
```bash
curl http://localhost:5000/api/health
# {"status":"ok","message":"PharmaFlow API is running"}
```

---

### 3. Setup the Frontend

Open a **new terminal window**:

```bash
# Navigate to frontend directory
cd pharmaflow/frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The app will open at: **http://localhost:3000**

---

## Login Credentials

| Username | Password  | Role  |
|----------|-----------|-------|
| admin    | clinic123 | Admin |
| staff    | staff456  | Staff |

---

## API Endpoints

All endpoints (except `/api/auth/login`) require:
```
Authorization: Bearer <jwt_token>
```

### Auth
| Method | Endpoint              | Description          |
|--------|-----------------------|----------------------|
| POST   | /api/auth/login       | Login, get JWT token |
| GET    | /api/auth/me          | Get current user     |
| POST   | /api/auth/register    | Create new user      |

### Medicines
| Method | Endpoint                  | Description          |
|--------|---------------------------|----------------------|
| GET    | /api/medicines            | Get all medicines    |
| GET    | /api/medicines/:id        | Get single medicine  |
| POST   | /api/medicines            | Create medicine      |
| PUT    | /api/medicines/:id        | Update medicine      |
| DELETE | /api/medicines/:id        | Delete medicine      |

**GET /api/medicines query params:**
- `search` — search by name
- `category` — filter by category (tablet, syrup, etc.)
- `status` — filter by status (instock, low, critical, expired)
- `sort` — sort field (default: -createdAt)
- `page`, `limit` — pagination

### Dashboard
| Method | Endpoint                  | Description                        |
|--------|---------------------------|------------------------------------|
| GET    | /api/dashboard/summary    | Stats + alerts + reorder list      |

---

## Stock Status Logic

| Status   | Condition                                | Color  |
|----------|------------------------------------------|--------|
| In Stock | quantity > minThreshold                  | Green  |
| Low      | quantity ≤ minThreshold AND quantity > 5 | Yellow |
| Critical | quantity ≤ 5 OR quantity = 0             | Red    |
| Expired  | expiryDate < today                       | Gray   |

**Reorder Quantity Formula:**
```
reorderQty = (minThreshold × 2) − currentQuantity
```

---

## Build for Production

```bash
# Build frontend
cd frontend
npm run build

# Serve the build with Express (add to backend/src/index.js):
# app.use(express.static(path.join(__dirname, '../../frontend/build')));
# app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../../frontend/build/index.html')));
```

---

## Environment Variables

### Backend `.env`
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/pharmaflow
JWT_SECRET=your_very_secret_key_here
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

### Frontend `.env`
```
REACT_APP_API_URL=http://localhost:5000/api
```

---

## Features

- **Dashboard** — stat cards, recent inventory, live alert panel
- **Inventory** — full CRUD, search, filter by category/status, progress bars
- **Alerts** — real-time critical/warning alerts, auto-refreshes every 15s
- **Reorder List** — auto-calculated reorder quantities, printable report
- **Auth** — JWT login, protected routes, role-based (admin/staff)
- **Toast notifications** — success/error feedback on every action
- **Expiry countdown** — "Expires in X days" / "Expired X days ago"
- **Mobile responsive** — works on phones and tablets

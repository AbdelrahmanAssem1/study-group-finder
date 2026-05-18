# 🎓 Study Group Finder System

A full-stack web application for a university Web Engineering course, built with **React.js**, **Node.js/Express**, and **MongoDB Atlas**.

---

## 📁 Project Structure

```
study-group-finder/
├── backend/                 # Node.js + Express API
│   ├── config/db.js         # MongoDB connection
│   ├── middleware/
│   │   ├── auth.js          # JWT authentication middleware
│   │   └── errorHandler.js  # Global error handler
│   ├── models/
│   │   ├── User.js          # User schema (bcrypt hashed passwords)
│   │   └── Session.js       # Study session schema with virtuals
│   ├── routes/
│   │   ├── auth.js          # Register, login, profile endpoints
│   │   └── sessions.js      # Full CRUD + join/leave endpoints
│   ├── server.js            # Express app entry point
│   ├── .env.example         # Environment variable template
│   └── package.json
│
└── frontend/                # React.js SPA
    ├── public/index.html
    └── src/
        ├── api/sessions.js  # Axios API helper functions
        ├── components/
        │   ├── Navbar.jsx       # Sticky navigation bar
        │   ├── SessionCard.jsx  # Reusable session card
        │   └── PrivateRoute.jsx # Protected route wrapper
        ├── context/
        │   └── AuthContext.jsx  # Global auth state (React Context)
        ├── pages/
        │   ├── Home.jsx         # Browse + filter sessions
        │   ├── Login.jsx        # Authentication
        │   ├── Register.jsx     # User registration
        │   ├── SessionDetail.jsx # Full session view
        │   ├── SessionForm.jsx  # Create / Edit session
        │   └── Dashboard.jsx    # Personal user dashboard
        ├── App.jsx              # Router + layout
        ├── index.js             # React entry point
        └── index.css            # Global design system
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+ and npm
- A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account

---

### 1. MongoDB Atlas Setup

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) and create a free account
2. Create a new **Cluster** (free tier M0)
3. Create a **Database User** with username & password
4. Under **Network Access**, add `0.0.0.0/0` (allow all IPs) for development
5. Click **Connect** → **Connect your application** → copy the connection string
6. Replace `<username>` and `<password>` in the string

---

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env and fill in your values:
# MONGODB_URI=mongodb+srv://youruser:yourpass@cluster0.xxxxx.mongodb.net/study-group-finder
# JWT_SECRET=any_long_random_string_here
# PORT=5000
```

Start the backend:
```bash
npm run dev     # Development (auto-restart with nodemon)
# or
npm start       # Production
```

The API will be running at: `http://localhost:5000`

Test it: open `http://localhost:5000/api/health` — you should see:
```json
{ "success": true, "message": "🎓 Study Group Finder API is running" }
```

---

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the React dev server
npm start
```

The app will open at: `http://localhost:3000`

> **Note**: The `"proxy": "http://localhost:5000"` in `frontend/package.json` automatically forwards `/api/*` requests to your backend.

---

## 🔌 REST API Reference

### Auth Endpoints

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login & get JWT | No |
| GET | `/api/auth/me` | Get current user | Yes |
| PUT | `/api/auth/me` | Update profile | Yes |

### Session Endpoints

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| GET | `/api/sessions` | List all sessions (filterable) | No |
| GET | `/api/sessions/my` | Get user's own sessions | Yes |
| GET | `/api/sessions/subjects` | Get distinct subjects | No |
| GET | `/api/sessions/:id` | Get session details | No |
| POST | `/api/sessions` | Create a session | Yes |
| PUT | `/api/sessions/:id` | Update session (creator only) | Yes |
| DELETE | `/api/sessions/:id` | Delete session (creator only) | Yes |
| POST | `/api/sessions/:id/join` | Join a session | Yes |
| DELETE | `/api/sessions/:id/leave` | Leave a session | Yes |

### Query Params for GET `/api/sessions`

```
?search=calculus       # Search in title/subject/description
?subject=Mathematics   # Filter by exact subject
?type=online           # Filter by type (online/offline)
?page=1&limit=12       # Pagination
```

---

## ✅ Features Implemented

- [x] **Full Authentication** — JWT-based register/login with bcrypt password hashing
- [x] **Full CRUD** — Create, Read, Update, Delete study sessions
- [x] **Join / Leave** — Participants management with capacity limits
- [x] **Filtering & Search** — By subject, type, and text search
- [x] **Pagination** — Server-side pagination for scalability
- [x] **Personal Dashboard** — View created and joined sessions
- [x] **Input Validation** — Server-side validation with `express-validator`
- [x] **Error Handling** — Global error handler, proper HTTP status codes
- [x] **Protected Routes** — Frontend guards for private pages
- [x] **Loading States** — Spinners while data fetches
- [x] **Toast Notifications** — Real-time feedback for all actions
- [x] **Responsive Design** — Works on desktop and mobile

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js 18, React Router v6, Axios |
| Styling | Custom CSS with CSS Variables (no framework) |
| State | React Context API |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas (Mongoose ODM) |
| Auth | JSON Web Tokens (JWT) + bcryptjs |
| Validation | express-validator |
| Notifications | react-hot-toast |

---

## 📝 Environment Variables

### Backend `.env`

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/study-group-finder
JWT_SECRET=your_secret_here
JWT_EXPIRE=7d
NODE_ENV=development
```

---

## 🎓 Academic Notes

This project demonstrates:
1. **3-Tier Architecture**: React (Presentation) → Express (Business Logic) → MongoDB (Data)
2. **RESTful API Design**: Proper HTTP verbs, status codes, and resource naming
3. **Separation of Concerns**: Models, Routes, Middleware, Context, Pages
4. **Security**: Password hashing, JWT authentication, route protection
5. **Full CRUD**: All Create, Read, Update, Delete operations implemented
6. **Real-world UX**: Loading states, error handling, instant UI updates

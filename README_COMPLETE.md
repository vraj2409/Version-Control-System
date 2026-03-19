# Version Control System (VCS) - Complete Documentation

A modern, full-stack distributed version control system built with Node.js, React, and MongoDB. This project provides Git-like functionality with a user-friendly web interface and RESTful API backend, designed for collaborative development with real-time updates and comprehensive issue tracking.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Workflow & Data Flow](#workflow--data-flow)
- [Design Patterns](#design-patterns)
- [Database Schema](#database-schema)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Project](#running-the-project)
- [API Documentation](#api-documentation)
- [Authentication & Security](#authentication--security)
- [Advanced Usage](#advanced-usage)
- [Performance & Scalability](#performance--scalability)
- [Error Handling](#error-handling)
- [Development Workflow](#development-workflow)
- [Deployment Guide](#deployment-guide)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## 🚀 Quick Start

```bash
# Clone and setup
git clone <repository-url>
cd V2

# Backend setup
cd backend
npm install
cp .env.example .env  # Configure with your values
npm start

# Frontend setup (new terminal)
cd frontend
npm install
npm run dev

# Access the application
# Frontend: http://localhost:5173
# Backend API: http://localhost:5000
# API Docs: http://localhost:5000/api
```

---

## ✨ Features

### Core Version Control
- **Repository Management** - Create, initialize, and manage repositories with descriptions
- **Commit System** - Atomic commits with messages, timestamps, and metadata tracking
- **Push/Pull Operations** - Synchronize changes between repositories with conflict resolution
- **Revert Functionality** - Roll back to previous commits with full history preservation
- **Content Versioning** - Track all file changes with complete version history
- **Repository Visibility** - Public/private repository access control

### Collaboration Features
- **Issue Tracking** - Create and manage issues (open/closed status)
- **Real-time Updates** - WebSocket support via Socket.IO for live notifications
- **User Profiles** - Comprehensive user account management
- **User Following** - Follow other developers to track their activity
- **Repository Starring** - Mark favorite repositories for quick access

### Authentication & Security
- **JWT Authentication** - Secure token-based user authentication
- **Password Security** - Bcryptjs encryption with salt rounds
- **Authorization Middleware** - Role-based access control (RBAC)
- **Secure Token Storage** - HttpOnly cookies and localStorage options

### Storage & Infrastructure
- **AWS S3 Integration** - Cloud storage for repository snapshots and backups
- **MongoDB NoSQL Database** - Scalable document storage for all data
- **Multi-env Support** - Development, staging, and production configurations
- **Error Logging** - Comprehensive error tracking and reporting

---

## 🛠 Tech Stack

### Backend
- **Runtime:** Node.js (v16+)
- **Framework:** Express.js v5.2.1
- **Database:** MongoDB v6.21.0 + Mongoose ODM v8.23.0
- **Authentication:** JWT (jsonwebtoken v9.0.3)
- **Password Hashing:** Bcryptjs v3.0.3 + Bcrypt v6.0.0
- **Cloud Storage:** AWS S3 SDK (@aws-sdk/client-s3 v3.1007.0)
- **Real-time:** Socket.IO v4.8.3
- **File Upload:** Multer v2.1.1
- **Utilities:** UUID v8.3.2, Yargs v17.7.2, Dotenv v17.3.1
- **DevTools:** Nodemon v3.1.14

### Frontend
- **Framework:** React 18.2.0
- **Build Tool:** Vite 5.0.8
- **Routing:** React Router v6.30.3
- **HTTP Client:** Axios v1.13.6
- **UI Icons:** Lucide React v0.577.0
- **Styling:** CSS3 with responsive design
- **Linting:** ESLint 8.55.0 with React plugins

### Additional Tools
- **Version Control:** Git
- **API Testing:** Postman
- **Package Manager:** npm/yarn
- **Containerization:** Docker-ready

---

## 🏗 System Architecture

### High-Level Three-Tier Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                       PRESENTATION LAYER                             │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  React Frontend (Vite)                                         │  │
│  │  ├─ UI Components (Navbar, Dashboard, RepoDetail, etc.)       │  │
│  │  ├─ Pages (Login, Signup, Home, Repos, Issues, Profile)      │  │
│  │  ├─ Context API (AuthContext)                                │  │
│  │  └─ Services (API Integration, WebSocket)                    │  │
│  └────────────────────────────────────────────────────────────────┘  │
└──────────────────────────┬────────────────────────────────────────────┘
                           │ HTTP/WebSocket Requests
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER                                │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  Express.js Server                                             │  │
│  │  ├─ Middleware Stack                                          │  │
│  │  │  ├─ CORS Handler                                          │  │
│  │  │  ├─ JSON/Multipart Parser                                │  │
│  │  │  ├─ Auth Middleware (verify JWT)                         │  │
│  │  │  └─ Authorization Middleware (RBAC)                      │  │
│  │  ├─ Router Layer                                             │  │
│  │  │  ├─ User Router (/api/auth)                             │  │
│  │  │  ├─ Repository Router (/api/repo)                       │  │
│  │  │  ├─ Commit Router (/api/commit)                         │  │
│  │  │  └─ Issue Router (/api/issue)                           │  │
│  │  ├─ Controller Layer                                         │  │
│  │  │  ├─ UserController                                       │  │
│  │  │  ├─ RepoController                                       │  │
│  │  │  ├─ CommitController                                     │  │
│  │  │  └─ IssueController                                      │  │
│  │  └─ Socket.IO Handler                                        │  │
│  │     └─ Real-time Event Broadcasting                          │  │
│  └────────────────────────────────────────────────────────────────┘  │
└──────────────────────┬─────────────────────┬─────────────────────────┘
                       │                     │
                       ▼                     ▼
┌──────────────────────────────────┐   ┌──────────────────────────────┐
│        BUSINESS LOGIC LAYER      │   │    DATA PERSISTENCE LAYER    │
│                                  │   │                              │
│  Models (Mongoose Schemas)       │   │  MongoDB Connection Pool     │
│  ├─ UserModel                    │   │  ├─ User Documents          │
│  ├─ RepositoryModel              │   │  ├─ Repository Documents    │
│  ├─ IssueModel                   │   │  ├─ Issue Documents         │
│  └─ Commit Operations            │   │  ├─ Commit History          │
│                                  │   │  └─ Timestamp Indexes       │
│  Services                        │   │                              │
│  ├─ AWS S3 Service               │   │  AWS S3 Buckets             │
│  ├─ Email Service                │   │  ├─ Repository Snapshots    │
│  └─ Validation Services          │   │  └─ Large File Storage      │
└──────────────────────────────────┘   └──────────────────────────────┘
```

### Component Interaction Diagram

```
┌─────────────────────┐
│   React Frontend    │
│                     │
│ ┌───────────────┐   │
│ │ AuthContext   │   │
│ └───────────────┘   │
│  ↓ (auth state)     │
│ ┌───────────────────────────────┐
│ │ Protected Components:         │
│ │ ├─ DashboardPage             │
│ │ ├─ RepoDetailPage            │
│ │ ├─ ReposPage                 │
│ │ └─ IssuesPage                │
│ └───────────────────────────────┘
│  ↓ (API calls)      │
│ ┌───────────────┐   │
│ │ API Service   │   │
│ │ (Axios)       │   │
│ └───────────────┘   │
└────────────┬────────┘
             │ HTTP + JWT Token
             ▼
┌────────────────────────────────────────────┐
│      Express Backend                        │
│                                             │
│ ┌──────────────────────────────────────┐   │
│ │ Auth Middleware                      │   │
│ │ ├─ Verify JWT                        │   │
│ │ ├─ Extract User ID                   │   │
│ │ └─ Set req.user                      │   │
│ └──────────────────────────────────────┘   │
│  ↓                                          │
│ ┌──────────────────────────────────────┐   │
│ │ Router (Route Selection)              │   │
│ │ ├─ POST /api/auth/login              │   │
│ │ ├─ POST /api/repo/init               │   │
│ │ ├─ POST /api/commit                  │   │
│ │ └─ POST /api/issue                   │   │
│ └──────────────────────────────────────┘   │
│  ↓                                          │
│ ┌──────────────────────────────────────┐   │
│ │ Controller Layer                      │   │
│ │ ├─ Receive Request Data              │   │
│ │ ├─ Validate Data                     │   │
│ │ ├─ Call Model Methods                │   │
│ │ └─ Format Response                   │   │
│ └──────────────────────────────────────┘   │
└────────────┬────────────────────────────────┘
             │
    ┌────────┴─────────┐
    ▼                  ▼
┌──────────────┐   ┌──────────────┐
│  MongoDB     │   │   AWS S3     │
│  ├─ Users    │   │  (Storage)   │
│  ├─ Repos    │   │  (Snapshots) │
│  ├─ Issues   │   │              │
│  └─ Commits  │   │              │
└──────────────┘   └──────────────┘
```

---

## 🔄 Workflow & Data Flow

### User Authentication Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│           1. REGISTRATION & LOGIN FLOW                          │
└─────────────────────────────────────────────────────────────────┘

A. Registration
   └─ User → Signup Form
      └─ POST /api/auth/signup {username, email, password}
         └─ Controller receives request
            ├─ Validate email format
            ├─ Check if user exists
            ├─ Hash password with bcryptjs (salt rounds: 10)
            ├─ Create User document
            ├─ Generate JWT token
            ├─ Return {token, user_id, username}
            └─ Store token in client (localStorage/httpOnly cookie)

B. Login
   └─ User → Login Form
      └─ POST /api/auth/login {email, password}
         └─ Controller receives request
            ├─ Find user by email
            ├─ Compare password with hash using bcryptjs
            ├─ If valid:
            │  ├─ Generate JWT (payload: {userId, email})
            │  ├─ Set expiration: 7 days
            │  └─ Return {token, user_id}
            └─ If invalid:
               └─ Return 401 Unauthorized

C. Authenticated Requests
   └─ Client includes token in header
      └─ Authorization: Bearer <token>
         └─ Server Auth Middleware
            ├─ Extract token from header
            ├─ Verify JWT signature
            ├─ Decode payload
            ├─ If valid:
            │  ├─ Extract userId
            │  ├─ Set req.user = {userId, email}
            │  └─ Continue to next middleware
            └─ If invalid:
               └─ Return 401 Unauthorized
```

### Repository Lifecycle Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│           2. REPOSITORY OPERATIONS FLOW                          │
└─────────────────────────────────────────────────────────────────┘

A. INITIALIZATION (myvcs init)
   ├─ POST /api/repo/init {repoName, description}
   ├─ Auth Middleware validates JWT
   ├─ Controller: RepoController.initRepo()
   │  ├─ Create Repository document
   │  │  ├─ name: "my-project"
   │  │  ├─ owner: userId
   │  │  ├─ visibility: true/false
   │  │  ├─ content: [] (empty)
   │  │  ├─ commits: [] (empty)
   │  │  └─ timestamps: {created_at, updated_at}
   │  ├─ Save to MongoDB
   │  ├─ Add repo ID to user.repositories[]
   │  └─ Return {repo_id, name, owner}
   └─ UI updates showing new repo

B. ADD FILES (myvcs add)
   ├─ Controller: RepoController.addFiles()
   ├─ Updates repository.content[]
   ├─ Marks as "staged" for commit
   └─ Local state management

C. COMMIT (myvcs commit -m "message")
   ├─ POST /api/commit {repoId, message, files}
   ├─ Auth Middleware validates
   ├─ Controller: CommitController.createCommit()
   │  ├─ Create Commit document
   │  │  ├─ hash: SHA1(timestamp + content)
   │  │  ├─ message: "Initial commit"
   │  │  ├─ author: userId
   │  │  ├─ timestamp: current
   │  │  ├─ repository: repoId
   │  │  └─ parentCommit: (previous commit hash)
   │  ├─ Save to MongoDB
   │  ├─ Update repo.commits[]
   │  ├─ Optional: Upload snapshot to S3
   │  └─ Return {commit_hash, message}
   ├─ Socket.IO broadcast: "commit:created"
   └─ All clients see notification

D. PUSH (myvcs push)
   ├─ POST /api/repo/{repoId}/push
   ├─ Sync local commits to remote
   ├─ Update repository.content
   ├─ Update repository.commits
   ├─ Mark repo as "pushed"
   ├─ Socket.IO broadcast: "repo:updated"
   └─ Collaborators notified

E. PULL (myvcs pull)
   ├─ GET /api/repo/{repoId}/pull
   ├─ Fetch latest commits from remote
   ├─ Download repository state
   ├─ Merge with local state
   ├─ Update UI with latest data
   └─ Check for merge conflicts

F. REVERT (myvcs revert <commit-hash>)
   ├─ POST /api/commit/revert
   ├─ Find commit by hash
   ├─ Load previous state snapshot
   ├─ Create revert commit (points to old state)
   ├─ Update repository content
   ├─ Socket.IO broadcast
   └─ UI updates to show reverted state
```

### Issue Tracking Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│           3. ISSUE MANAGEMENT FLOW                              │
└─────────────────────────────────────────────────────────────────┘

A. CREATE ISSUE
   ├─ POST /api/issue {title, description, repoId}
   ├─ Auth Middleware validates
   ├─ Controller: IssueController.createIssue()
   │  ├─ Create Issue document
   │  │  ├─ title: "Fix bug in login"
   │  │  ├─ description: "..."
   │  │  ├─ status: "open"
   │  │  ├─ repository: repoId
   │  │  ├─ creator: userId
   │  │  └─ timestamps
   │  ├─ Save to MongoDB
   │  ├─ Add to repository.issues[]
   │  └─ Return Issue document
   ├─ Socket.IO broadcast: "issue:created"
   └─ Watchers notified

B. UPDATE ISSUE STATUS
   ├─ PUT /api/issue/{issueId} {status: "closed"}
   ├─ Update Issue.status
   ├─ Save to database
   ├─ Socket.IO broadcast: "issue:updated"
   └─ Real-time UI update

C. DELETE ISSUE
   ├─ DELETE /api/issue/{issueId}
   ├─ Verify ownership/permissions
   ├─ Remove from MongoDB
   ├─ Remove from repository.issues[]
   ├─ Socket.IO broadcast: "issue:deleted"
   └─ UI removes issue
```

### Real-time Notification Flow (Socket.IO)

```
Client A sends action
    ↓
Server receives action
    ↓
Controller processes
    ↓
Data saved to MongoDB
    ↓
Socket.IO server broadcasts event
    ├─ Broadcast to Client A (confirmation)
    ├─ Broadcast to Client B (update)
    └─ Broadcast to Client C (update)
    ↓
All clients receive event
    ↓
React state updates
    ↓
UI re-renders with new data
```

---

## 🎨 Design Patterns & Architecture

### 1. Model-View-Controller (MVC) Pattern
```
Models (Mongoose)
    ├─ UserModel
    ├─ RepositoryModel
    ├─ IssueModel
    └─ Commit Operations
         ↓
Controllers (Business Logic)
    ├─ UserController
    ├─ RepoController
    ├─ CommitController
    └─ IssueController
         ↓
Routes & Views (API Endpoints + Frontend)
    ├─ Express Routes
    └─ React Components
         ↓
Client UI
```

### 2. Middleware Chain Pattern
```
Request
  ↓
CORS Middleware
  ↓
JSON Parser Middleware
  ↓
Auth Middleware (Verify JWT)
  ↓
Authorization Middleware (Check Permissions)
  ↓
Request Validator Middleware
  ↓
Controller Handler
  ↓
Error Handler Middleware
  ↓
Response
```

### 3. Context API Pattern (React)
```
AuthContext (Global State)
  ├─ authState: {isAuthenticated, user, token}
  ├─ login(): Sets auth state
  ├─ logout(): Clears auth state
  ├─ signup(): Creates user and sets auth
  └─ Provided to all components via <AuthProvider>
```

### 4. Service Layer Pattern
```
API Service (api.js)
  ├─ Centralized Axios instance
  ├─ Base URL configuration
  ├─ Request/Response interceptors
  ├─ Error handling
  └─ Token management
```

### 5. Protected Route Pattern
```
<ProtectedRoute>
  ├─ Check if authenticated
  ├─ If yes: Render Component
  ├─ If no: Redirect to /login
  └─ Check user permissions
```

### 6. Singleton Pattern (Database)
```
MongoDB Connection
  ├─ Established once on app start
  ├─ Connection pool created
  ├─ Reused for all operations
  └─ Graceful shutdown on app close
```

---

## 💾 Database Schema

### User Model
```javascript
{
  _id: ObjectId (Primary Key),
  username: String (unique, required),
  email: String (unique, required),
  password: String (hashed with bcryptjs),
  repositories: [ObjectId] (references Repository),
  followedUsers: [ObjectId] (references User),
  starRepos: [ObjectId] (references Repository),
  createdAt: Date (auto-generated),
  updatedAt: Date (auto-updated),
  
  // Methods
  comparePassword(password): Boolean
  generateAuthToken(): String
}
```

### Repository Model
```javascript
{
  _id: ObjectId (Primary Key),
  name: String (unique, required),
  description: String,
  owner: ObjectId (references User),
  visibility: Boolean (true = public, false = private),
  content: [String] (file content snapshots),
  issues: [ObjectId] (references Issue),
  commits: [
    {
      hash: String,
      message: String,
      author: ObjectId,
      timestamp: Date,
      parentCommit: String,
      snapshot: String (S3 location)
    }
  ],
  createdAt: Date,
  updatedAt: Date,
  
  // Virtual fields
  commitCount: Number
  issueCount: Number
  lastCommitDate: Date
}
```

### Issue Model
```javascript
{
  _id: ObjectId (Primary Key),
  title: String (required),
  description: String (required),
  status: Enum ["open", "closed"] (default: "open"),
  repository: ObjectId (references Repository),
  creator: ObjectId (references User),
  assignees: [ObjectId] (references User),
  labels: [String] (bug, feature, enhancement, etc.),
  priority: Enum ["low", "medium", "high"],
  createdAt: Date,
  updatedAt: Date,
  resolvedAt: Date (when closed)
}
```

### Commit Model (Embedded in Repository)
```javascript
{
  hash: String (SHA1 of commit data),
  message: String (commit message),
  author: ObjectId (references User),
  parentHash: String (previous commit),
  tree: {
    files: [
      {
        path: String,
        content: String,
        mode: String ("100644", "100755")
      }
    ]
  },
  timestamp: Date,
  s3Snapshot: String (URL to S3 storage),
  stats: {
    additions: Number,
    deletions: Number,
    filesChanged: Number
  }
}
```

### Database Relationships

```
User
  ├─ One → Many: Repositories (owner)
  ├─ Many → Many: Users (following)
  └─ Many → Many: Repositories (starred)

Repository
  ├─ Many → One: User (owner)
  ├─ One → Many: Issues
  └─ Many → One: Commits (embedded)

Issue
  ├─ Many → One: Repository
  ├─ Many → One: User (creator)
  └─ Many → Many: Users (assignees)

Commit (Embedded in Repository)
  ├─ Many → One: Repository
  └─ Many → One: User (author)
```

---

## 📁 Project Structure

```
V2/
├── backend/                          # Node.js Express API Server
│   ├── config/
│   │   └── aws-config.js            # AWS S3 configuration
│   │
│   ├── controllers/                  # Business Logic Layer
│   │   ├── userController.js         # User registration/login
│   │   ├── repoController.js         # Repository operations
│   │   ├── commitController.js       # Commit management
│   │   ├── issueController.js        # Issue tracking
│   │   ├── add.js                    # File staging
│   │   ├── commit.js                 # Commit helper
│   │   ├── init.js                   # Repo initialization
│   │   ├── pull.js                   # Pull operations
│   │   ├── push.js                   # Push operations
│   │   └── revert.js                 # Revert operations
│   │
│   ├── middleware/                   # Request Processing
│   │   ├── auth.js                   # JWT verification
│   │   └── authorizeMiddleware.js    # Permission checks
│   │
│   ├── models/                       # Data Models (Mongoose)
│   │   ├── userModel.js              # User schema
│   │   ├── repoModel.js              # Repository schema
│   │   └── issueModel.js             # Issue schema
│   │
│   ├── routes/                       # API Endpoints
│   │   ├── main.router.js            # Main router
│   │   ├── user.router.js            # /api/auth routes
│   │   ├── repo.router.js            # /api/repo routes
│   │   ├── commit.router.js          # /api/commit routes
│   │   └── issue.router.js           # /api/issue routes
│   │
│   ├── server.js                     # Express server setup
│   ├── index.js                      # Entry point / CLI
│   ├── package.json
│   ├── .env.example
│   └── .env                          # Secrets (local only)
│
├── frontend/                         # React + Vite App
│   ├── src/
│   │   ├── components/               # Reusable Components
│   │   │   ├── Navbar.jsx           # Navigation bar
│   │   │   ├── ProtectedRoute.jsx   # Route protection
│   │   │   └── UI.jsx               # Common UI elements
│   │   │
│   │   ├── context/                  # Global State
│   │   │   └── AuthContext.jsx       # Authentication state
│   │   │
│   │   ├── pages/                    # Page Components
│   │   │   ├── LoginPage.jsx
│   │   │   ├── SignupPage.jsx
│   │   │   ├── HomePage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── ReposPage.jsx
│   │   │   ├── RepoDetailPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   └── SearchPage.jsx
│   │   │
│   │   ├── services/                 # API Integration
│   │   │   └── api.js                # Axios configuration
│   │   │
│   │   ├── assets/                   # Static files
│   │   ├── App.jsx                   # Root component
│   │   ├── main.jsx                  # React entry
│   │   └── index.css                 # Global styles
│   │
│   ├── public/                       # Public assets
│   ├── vite.config.js               # Vite configuration
│   ├── eslint.config.js             # ESLint rules
│   ├── index.html                   # HTML template
│   ├── package.json
│   └── .env.example
│
├── hello-world/                      # CLI Testing Module
│   ├── config.js
│   ├── index.js
│   └── README.md
│
├── .git/                             # Git repository
├── .gitignore
└── README.md                         # This file
```

---

## 📦 Prerequisites

- **Node.js** v16+ ([Download](https://nodejs.org/))
- **npm** 7+ or **yarn** 1.22+
- **MongoDB** 5.0+ ([Community Edition](https://www.mongodb.com/try/download/community) or [Atlas Cloud](https://www.mongodb.com/cloud/atlas))
- **Git** 2.30+
- **AWS Account** with S3 bucket (optional, for file storage)
- **Postman** or similar tool for API testing (optional)

---

## 🔧 Installation

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/V2.git
cd V2
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration
# See Configuration section below
```

### 3. Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install

# Create .env file (if needed)
cp .env.example .env
```

### 4. Verify Installation
```bash
# Backend
cd backend
npm start
# Should output: "Server running on port 5000"

# Frontend (new terminal)
cd frontend
npm run dev
# Should output: "Local: http://localhost:5173"
```

---

## ⚙️ Configuration

### Backend Environment Variables (.env)

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name
# Local MongoDB Alternative:
# MONGODB_URI=mongodb://localhost:27017/vcs_db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# AWS S3 Configuration (Optional)
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name

# Frontend Configuration
FRONTEND_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173

# Security
BCRYPT_SALT_ROUNDS=10
```

### Frontend Configuration (.env)

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_API_TIMEOUT=10000
```

### MongoDB Setup

**Option A: Local MongoDB**
```bash
# Install MongoDB Community Edition
# Start MongoDB service
mongod

# It will be available at mongodb://localhost:27017
```

**Option B: MongoDB Atlas (Cloud)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create account and sign in
3. Create new cluster
4. Create database user
5. Get connection string
6. Add to `.env`: `MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname`

### AWS S3 Setup

1. Go to AWS Console
2. Create S3 bucket
3. Generate access credentials (IAM user)
4. Configure bucket CORS:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["http://localhost:5173"],
    "ExposeHeaders": ["ETag"]
  }
]
```

---

## 🚀 Running the Project

### Option 1: Development (Recommended)

**Terminal 1 - Backend:**
```bash
cd backend
npm start
# Server runs at http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# App runs at http://localhost:5173
```

### Option 2: Using nodemon (Auto-reload on changes)

**Backend:**
```bash
cd backend
npx nodemon server.js
```

### Option 3: Production Build

**Frontend Build:**
```bash
cd frontend
npm run build
# Creates optimized build in dist/
```

**Backend (Production):**
```bash
cd backend
NODE_ENV=production npm start
```

### Option 4: Docker (If Dockerized)

```bash
docker-compose up -d
```

---

## 📚 API Documentation

### Base URL
- **Development:** `http://localhost:5000/api`
- **Production:** Your deployment URL

### Authentication Endpoints (`/api/auth`)

#### Signup
```http
POST /api/auth/signup
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword123"
}

Response (201 Created):
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}

Response (200 OK):
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>

Response (200 OK):
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john@example.com",
    "repositories": ["507f1f77bcf86cd799439012"],
    "followedUsers": [],
    "starRepos": []
  }
}
```

### Repository Endpoints (`/api/repo`)

#### Initialize Repository
```http
POST /api/repo/init
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "my-project",
  "description": "My awesome project",
  "visibility": true
}

Response (201 Created):
{
  "repository": {
    "id": "507f1f77bcf86cd799439012",
    "name": "my-project",
    "owner": "507f1f77bcf86cd799439011",
    "description": "My awesome project",
    "visibility": true,
    "commits": [],
    "issues": [],
    "createdAt": "2024-03-16T10:30:00Z"
  }
}
```

#### List User Repositories
```http
GET /api/repo
Authorization: Bearer <token>

Response (200 OK):
{
  "repositories": [
    {
      "id": "507f1f77bcf86cd799439012",
      "name": "my-project",
      "owner": "507f1f77bcf86cd799439011",
      "description": "My awesome project",
      "commits": 5,
      "issues": 2
    }
  ]
}
```

#### Get Repository Details
```http
GET /api/repo/{repoId}
Authorization: Bearer <token>

Response (200 OK):
{
  "repository": {
    "id": "507f1f77bcf86cd799439012",
    "name": "my-project",
    "content": ["file1.js", "file2.js"],
    "commits": [...],
    "issues": [...],
    "owner": {...}
  }
}
```

#### Push Repository
```http
POST /api/repo/{repoId}/push
Authorization: Bearer <token>
Content-Type: application/json

{
  "commits": [
    {
      "hash": "abc123def456",
      "message": "Initial commit",
      "content": ["file1.js"]
    }
  ]
}

Response (200 OK):
{
  "message": "Push successful",
  "commits_synced": 1
}
```

#### Pull Repository
```http
GET /api/repo/{repoId}/pull
Authorization: Bearer <token>

Response (200 OK):
{
  "commits": [...],
  "content": ["file1.js", "file2.js"],
  "lastSync": "2024-03-16T10:35:00Z"
}
```

### Commit Endpoints (`/api/commit`)

#### Create Commit
```http
POST /api/commit
Authorization: Bearer <token>
Content-Type: application/json

{
  "repositoryId": "507f1f77bcf86cd799439012",
  "message": "Add new features",
  "files": ["feature.js", "test.js"]
}

Response (201 Created):
{
  "commit": {
    "hash": "abc123def456",
    "message": "Add new features",
    "author": "johndoe",
    "timestamp": "2024-03-16T10:40:00Z",
    "parentHash": "previous_hash"
  }
}
```

#### Get Commit History
```http
GET /api/commit/history/{repoId}
Authorization: Bearer <token>

Response (200 OK):
{
  "commits": [
    {
      "hash": "abc123def456",
      "message": "Add new features",
      "author": "johndoe",
      "timestamp": "2024-03-16T10:40:00Z"
    },
    {
      "hash": "xyz789",
      "message": "Initial commit",
      "author": "johndoe",
      "timestamp": "2024-03-16T10:30:00Z"
    }
  ]
}
```

#### Revert to Commit
```http
POST /api/commit/revert
Authorization: Bearer <token>
Content-Type: application/json

{
  "repositoryId": "507f1f77bcf86cd799439012",
  "commitHash": "xyz789"
}

Response (200 OK):
{
  "message": "Reverted successfully",
  "currentState": {
    "hash": "new_revert_hash",
    "message": "Revert to xyz789",
    "previousState": "abc123def456"
  }
}
```

### Issue Endpoints (`/api/issue`)

#### Create Issue
```http
POST /api/issue
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Fix login bug",
  "description": "Users cannot login with special characters",
  "repositoryId": "507f1f77bcf86cd799439012",
  "priority": "high"
}

Response (201 Created):
{
  "issue": {
    "id": "507f1f77bcf86cd799439013",
    "title": "Fix login bug",
    "description": "Users cannot login with special characters",
    "status": "open",
    "creator": "johndoe",
    "repository": "507f1f77bcf86cd799439012",
    "priority": "high",
    "createdAt": "2024-03-16T10:45:00Z"
  }
}
```

#### List Issues
```http
GET /api/issue?repositoryId={repoId}&status=open
Authorization: Bearer <token>

Response (200 OK):
{
  "issues": [
    {
      "id": "507f1f77bcf86cd799439013",
      "title": "Fix login bug",
      "status": "open",
      "priority": "high",
      "creator": "johndoe"
    }
  ]
}
```

#### Update Issue
```http
PUT /api/issue/{issueId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "closed",
  "title": "Fix login bug"
}

Response (200 OK):
{
  "issue": {
    "id": "507f1f77bcf86cd799439013",
    "status": "closed",
    "updatedAt": "2024-03-16T10:50:00Z"
  }
}
```

#### Delete Issue
```http
DELETE /api/issue/{issueId}
Authorization: Bearer <token>

Response (204 No Content)
```

---

## 🔐 Authentication & Security

### JWT Token Structure
```
Header: { "alg": "HS256", "typ": "JWT" }

Payload: {
  "userId": "507f1f77bcf86cd799439011",
  "email": "john@example.com",
  "iat": 1676400000,           // Issued at
  "exp": 1677004800             // Expires (7 days later)
}

Signature: HMACSHA256(base64(header) + "." + base64(payload), JWT_SECRET)
```

### Password Security
- **Algorithm:** Bcryptjs
- **Salt Rounds:** 10
- **Hash Format:** $2b$10$... (bcrypt hash)

### Authorization Levels
```
Public:   Anyone can access
Authenticated: Must have valid JWT token
Owner Only: Must be repository owner
Admin: Specific admin users
```

### CORS Configuration
```javascript
// Allowed origins can be configured in middleware
CORS_ORIGIN=http://localhost:5173,https://yourdomain.com
```

---

## 💡 Advanced Usage

### Using the CLI (hello-world module)

```bash
cd hello-world

# Initialize repository
npm start
# Interactive CLI prompts

# Or direct commands
myvcs init <repo-name>
myvcs add <files>
myvcs commit -m "message"
myvcs push
myvcs pull
myvcs revert <commit-hash>
```

### WebSocket Events (Socket.IO)

**Client listening:**
```javascript
// In React component
import io from 'socket.io-client';

useEffect(() => {
  const socket = io('http://localhost:5000');
  
  // Listen for events
  socket.on('repo:updated', (data) => {
    console.log('Repository updated:', data);
  });
  
  socket.on('issue:created', (issue) => {
    console.log('New issue:', issue);
  });
  
  return () => socket.disconnect();
}, []);
```

**Server emitting:**
```javascript
// In Express controller
io.emit('repo:updated', {
  repoId: repositoryId,
  action: 'commit',
  commit: newCommit
});
```

### Batch Operations

```javascript
// Multiple commits in single transaction
POST /api/commit/batch
{
  "repositoryId": "...",
  "commits": [
    {"message": "commit 1", "files": [...]},
    {"message": "commit 2", "files": [...]}
  ]
}
```

### Filtering and Searching

```javascript
// Search repositories
GET /api/repo/search?query=react&sort=stars&order=desc

// Filter issues
GET /api/issue?status=open&priority=high&assignee=userId

// Get commit history with pagination
GET /api/commit/history/{repoId}?page=1&limit=20
```

---

## 📈 Performance & Scalability

### Database Optimization
```
- Indexes on: userId, repositoryId, status
- Connection pooling enabled
- Query optimization via Mongoose lean()
- Pagination for large result sets
```

### Caching Strategy
```
- Frontend: React state management
- Backend: Session caching (future)
- CDN: For static assets
```

### Load Handling
```
- Horizontal scaling: Multiple backend instances
- Load balancer: Nginx/HAProxy
- Database replication: MongoDB replica sets
- Message queue: For heavy operations (future)
```

### Monitoring
```
- Logging: Winston/Bunyan
- APM: New Relic / DataDog (future)
- Health checks: /health endpoint
```

---

## 🚨 Error Handling

### Common Error Codes

| Code | Message | Cause |
|------|---------|-------|
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists |
| 429 | Too Many Requests | Rate limited |
| 500 | Server Error | Internal error |

### Error Response Format
```javascript
{
  "success": false,
  "error": {
    "code": "REPO_NOT_FOUND",
    "message": "Repository with ID 123 not found",
    "statusCode": 404,
    "details": {
      "repoId": "123"
    }
  }
}
```

### Error Handling in Frontend
```javascript
// In API service
try {
  const response = await api.post('/repo/init', data);
  return response.data;
} catch (error) {
  if (error.response?.status === 401) {
    // Token expired - redirect to login
    window.location.href = '/login';
  } else if (error.response?.status === 409) {
    // Show conflict error to user
    throw new Error('Repository name already exists');
  }
  throw error;
}
```

---

## 🔨 Development Workflow

### 1. Setting up Development Environment

```bash
# Install pre-commit hooks (optional)
npm install husky --save-dev
npx husky install

# Setup linting
cd frontend
npm run lint

cd ../backend
npm run lint
```

### 2. Git Workflow

```bash
# Create feature branch
git checkout -b feature/amazing-feature

# Make changes and commit
git add .
git commit -m "feat: add amazing feature"

# Push to remote
git push origin feature/amazing-feature

# Create Pull Request on GitHub
```

### 3. Commit Message Format

```
feat: Add user authentication
fix: Resolve login bug with special characters
docs: Update README documentation
style: Format code according to eslint rules
refactor: Restructure controllers for clarity
test: Add unit tests for commit service
chore: Update dependencies
```

### 4. Testing

```bash
# Backend tests (if configured)
cd backend
npm test

# Frontend tests (if configured)
cd frontend
npm test
```

### 5. Code Quality Checks

```bash
# Linting
npm run lint

# Format code
npm run format

# Security audit
npm audit

# Dependencies check
npm outdated
```

---

## 🚢 Deployment Guide

### Deployment Checklist

- [ ] Environment variables configured
- [ ] Database backup strategy in place
- [ ] S3 bucket set up and configured
- [ ] SSL/TLS certificates installed
- [ ] CORS settings updated for domain
- [ ] Rate limiting implemented
- [ ] Logging and monitoring set up
- [ ] Backup and recovery procedure tested

### Heroku Deployment

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create my-vcs-app

# Add environment variables
heroku config:set JWT_SECRET=xxx
heroku config:set MONGODB_URI=xxx

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

### AWS EC2 Deployment

```bash
# SSH into instance
ssh -i key.pem ec2-user@your-instance.amazonaws.com

# Install dependencies
sudo apt-get update && sudo apt-get install nodejs npm mongodb

# Clone and setup
git clone your-repo
cd V2/backend
npm install
PM2 start server.js
```

### Docker Deployment

```bash
# Build image
docker build -t vcs-backend:latest .

# Run container
docker run -d -p 5000:5000 \
  -e MONGODB_URI=mongodb://... \
  -e JWT_SECRET=... \
  vcs-backend:latest

# Using Docker Compose
docker-compose up -d
```

---

## 🐛 Troubleshooting

### MongoDB Connection Issues

**Error:** `MongoNetworkError: connect ECONNREFUSED`
```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB service
# macOS: brew services start mongodb-community
# Windows: Start-Service MongoDB
# Linux: sudo systemctl start mongod
```

**Error:** `authentication failed`
```bash
# Check credentials in .env
# Verify username and password in MongoDB

# Reset connection string
MONGODB_URI=mongodb://localhost:27017/vcs_db
```

### JWT Token Issues

**Error:** `JsonWebTokenError: invalid token`
```javascript
// Check if token is being sent correctly
Authorization: Bearer <token>

// Verify JWT_SECRET matches frontend and backend
```

**Error:** `TokenExpiredError`
```javascript
// Token expired - user needs to login again
// Implement token refresh mechanism

POST /api/auth/refresh
{
  "refreshToken": "..."
}
```

### CORS Errors

**Error:** `Access to XMLHttpRequest has been blocked by CORS policy`
```javascript
// Update CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

// Check .env CORS_ORIGIN setting
```

### Port Already in Use

**Error:** `Error: listen EADDRINUSE: address already in use :::5000`
```bash
# Kill process using port
# Windows: netstat -ano | findstr :5000
# Mac/Linux: lsof -i :5000
# Kill: kill -9 <PID>

# Or use different port
PORT=5001 npm start
```

### Frontend Not Loading

**Error:** `Cannot GET /`
```bash
# Frontend build not created
cd frontend
npm run build

# Check if served correctly
npm run preview
```

### S3 Upload Errors

**Error:** `Access Denied` or `NoSuchBucket`
```javascript
// Check AWS credentials
console.log(process.env.AWS_ACCESS_KEY_ID);

// Verify bucket name and region
// Ensure IAM user has S3 permissions
```

---

## 🤝 Contributing

### How to Contribute

1. **Fork the repository**
   ```bash
   git clone https://github.com/your-username/V2.git
   ```

2. **Create feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make changes**
   - Write clean, documented code
   - Follow project coding standards
   - Add comments for complex logic

4. **Commit with descriptive messages**
   ```bash
   git commit -m "feat: add amazing feature"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```

6. **Create Pull Request**
   - Describe changes clearly
   - Link to related issues
   - Request reviews from maintainers

### Code Standards

- Use consistent indentation (2 spaces)
- Add JSDoc comments to functions
- Write meaningful variable names
- Keep functions small and focused
- Add tests for new features

### Testing Before Submission

```bash
# Run linter
npm run lint

# Run tests
npm test

# Build
npm run build

# Check for console errors
npm run dev
```

---

## 📝 License

ISC License - See individual `package.json` files for details.

```
Copyright (c) 2024 Version Control System Contributors

Permission to use, copy, modify, and distribute this software is granted...
```

---

## 👥 Team & Support

### Author
**Vraj Patel** - Backend Lead & Project Creator

### Contributors
- Frontend Developer: [Your team members]
- DevOps Engineer: [Your team members]
- QA/Testing: [Your team members]

### Getting Help

- **Documentation:** Check README.md and inline comments
- **Issues:** Open GitHub Issues for bugs and features
- **Discussions:** Use GitHub Discussions for questions
- **Email:** contact@example.com
- **Discord:** [Join our community server](#)

### Reporting Issues

When reporting issues, please include:
1. Screenshots or error messages
2. Steps to reproduce
3. Environment details (Node version, OS, browser)
4. Expected vs actual behavior

---

## 📊 Project Statistics

- **Lines of Code:** ~5000+
- **Database Models:** 3
- **API Endpoints:** 20+
- **React Components:** 10+
- **Test Coverage:** [To be added]
- **Last Updated:** March 2026

---

## 🙏 Acknowledgments

- Express.js team for excellent framework
- MongoDB for reliable database
- React team for powerful UI library
- Our community for feedback and contributions

---

## 📅 Changelog

### Version 1.0.0 (March 2026)
- Initial release
- Core VCS functionality
- User authentication
- Repository management
- Issue tracking
- Real-time updates
- AWS S3 integration

### Upcoming Features
- Branch management
- Merge conflict resolution
- Pull requests
- Code review system
- Webhooks
- CLI tool enhancements
- Mobile app

---

**Happy Coding! 🚀**

For the latest updates, visit: https://github.com/yourusername/V2

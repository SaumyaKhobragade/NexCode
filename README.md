# 🚀 NexCode — Cloud-Native Developer Platform & Distributed VCS

![NexCode Banner](https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1400&q=80)

> A modern, full-stack, distributed version control system and developer cloud hub built with Node.js, Express, MongoDB, AWS S3, React, and Vite.

---

## 🌟 Overview

**NexCode** combines the power of a lightweight distributed version control engine (inspired by Git) with a developer cloud platform (inspired by GitHub / GitLab). 

Developers can manage local commits, stage changes, push/pull snapshots to cloud object storage (AWS S3) via the **NexCode CLI**, while collaborating on repositories, tracking issues with multi-user discussion threads, and monitoring contributions through a modern web interface.

---

## ⚡ Key Features

### 🖥️ 1. NexCode CLI (Distributed Version Control Engine)
- **`init`**: Initializes a local `.nexcode` repository tracking `.nexcode/index`, `.nexcode/commits`, and snapshots.
- **`add <file>`**: Stages files into `.nexcode/index` for tracking.
- **`commit <message>`**: Creates immutable commit snapshots with SHA-based IDs, timestamps, and commit metadata.
- **`push`**: Streams local commits and file blobs to cloud object storage (AWS S3 bucket).
- **`pull`**: Synchronizes remote snapshots and pulls files down to the local working directory.
- **`revert <commitID>`**: Safely rolls back project state to a specified commit snapshot.

### 🌐 2. Web Application Hub
- **Authentication**: Modern cyber-styled Sign In and Sign Up with JWT authentication, password visibility toggles, and client-side form validation.
- **Developer Dashboard**:
  - Personalized developer greeting and live metrics (Total Repos, Public, Private, Community).
  - Quick repository filters (All, Public, Private) with live counts.
  - Center feed with instant search and 1-click clone command copy.
  - "+ New Repository" creation modal.
  - Interactive NexCode CLI Cheat Sheet.
- **Developer Profile**:
  - User identity card with custom avatar, handle, email, and copy profile URL button.
  - **Dynamic Contribution HeatMap**: Rolling 5-month calendar with contribution metrics.
  - Tab navigation: **Overview**, **Repositories** (with filter search), and **Settings** (update email/password).
- **Repository Detail Pages (`/repo/:id`)**:
  - **Code Tab**: Branch indicator (`main`), file explorer table with commit messages and timestamps, interactive modal file viewer with raw copy, formatted README preview card, and repository stats sidebar.
  - **Issues Tab**: Filter by status (All, Open, Closed), real-time issue search, and "+ New Issue" modal.
  - **Settings Tab**: Repository rename, description editor, 1-click visibility switch (`Public` ↔ `Private`), and Danger Zone delete.
- **Issue Tracker & Discussion Threads (`/issues/:id` & `/issues`)**:
  - **Global Issues Hub**: Cross-repository issue dashboard with status pills, repository dropdown filter, and search.
  - **Issue Detail Conversation**:
    - Inline editable title and description.
    - Chronological comment cards stream.
    - Comment submission form with "Close Issue & Comment" / "Reopen Issue & Comment" actions.
    - Interactive label manager (`bug`, `enhancement`, `documentation`, `high-priority`, `help-wanted`).
    - Status switcher and 1-click repository jump link.

---

## 🏗️ Architecture & Tech Stack

```
NexCode/
├── backend/                  # REST API + WebSocket + CLI Engine
│   ├── commands/             # CLI command implementations (init, add, commit, push, pull, revert)
│   ├── config/               # AWS S3 and database configurations
│   ├── controllers/          # Business logic (auth, repo, issue)
│   ├── models/               # Mongoose schemas (User, Repository, Issue)
│   ├── routes/               # Express routing (userRoutes, repoRoutes, issueRoutes)
│   ├── index.js              # Server entrypoint & Yargs CLI router
│   └── package.json
│
├── frontend/                 # React 19 + Vite SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/         # Login & Signup forms
│   │   │   ├── dashboard/    # Main Dashboard & Repo Feed
│   │   │   ├── issue/        # IssueDetail & GlobalIssues
│   │   │   ├── repo/         # RepoDetail & Code Explorer
│   │   │   ├── user/         # Profile & HeatMap
│   │   │   └── Navbar.jsx    # Sticky navigation header
│   │   ├── contexts/         # AuthContext
│   │   ├── App.jsx           # Client-side router
│   │   └── main.jsx
│   └── package.json
└── README.md
```

### Technologies Used
| Layer | Technologies |
|---|---|
| **Backend & CLI** | Node.js (v24+), Express 5, Mongoose 9, MongoDB Atlas, AWS SDK v3 (@aws-sdk/client-s3), Socket.IO, Yargs, bcryptjs, JWT |
| **Frontend** | React 19, Vite, React Router v7, Axios, React Calendar Heatmap, Vanilla CSS (Glassmorphic Cyber Aesthetic) |
| **Storage** | MongoDB (Metadata, Users, Repositories, Issues, Comments) & AWS S3 (Blobs & Snapshots) |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) or local MongoDB instance
- [AWS Account](https://aws.amazon.com/) with an S3 bucket configured

---

### 1. Backend Setup

1. Open a terminal and navigate to `backend/`:
   ```bash
   cd backend
   npm install
   ```

2. Create a `.env` file in the `backend/` directory:
   ```env
   PORT=3000
   MONGO_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/nexcode?retryWrites=true&w=majority
   JWT_SECRET_KEY=your_super_secret_jwt_key
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   S3_BUCKET_NAME=your_nexcode_s3_bucket
   ```

3. Start the Express API server:
   ```bash
   node index.js start
   ```
   > Server will initialize on `http://localhost:3000` and connect to MongoDB.

---

### 2. Frontend Setup

1. Open a new terminal and navigate to `frontend/`:
   ```bash
   cd frontend
   npm install
   ```

2. Start the Vite development server:
   ```bash
   npm run dev
   ```
   > Web application will be live at `http://localhost:5173`.

3. To create a production bundle:
   ```bash
   npm run build
   ```

---

## 💻 CLI Usage Guide

NexCode provides built-in version control commands accessible via the CLI:

```bash
# 1. Initialize a repository in the current working directory
node index.js init

# 2. Stage a file for tracking
node index.js add index.js

# 3. Commit staged changes with a descriptive message
node index.js commit "Implement distributed executor pipeline"

# 4. Push local commits and snapshots to AWS S3
node index.js push

# 5. Pull latest remote changes from AWS S3
node index.js pull

# 6. Revert working tree to a specific commit snapshot
node index.js revert <commitID>
```

---

## 📡 API Endpoints Reference

### Authentication & Users
- `POST /signup` — Register a new developer account.
- `POST /login` — Authenticate and receive JWT + user identity.
- `GET /userProfile/:id` — Fetch user account details.
- `PUT /updateProfile/:id` — Update email or password credentials.

### Repositories (`/repo` or `/repositories`)
- `POST /repo/create` — Create a new repository.
- `GET /repo/all` — Fetch all public repositories.
- `GET /repo/:id` — Fetch detailed repository metadata with populated owner and issues.
- `GET /repo/user/:userId` — Fetch repositories owned by current user.
- `PUT /repo/update/:id` — Update repository name or description.
- `PATCH /repo/toggle/:id` — Toggle visibility between Public and Private.
- `DELETE /repo/delete/:id` — Permanently delete repository.

### Issues (`/issues` or `/issue`)
- `POST /issues/create` — Open a new issue under a repository.
- `GET /issues/all` — Fetch all issues cross-repository.
- `GET /issues/repo/:repoId` — Fetch issues belonging to a specific repository.
- `GET /issues/:id` — Fetch issue detail with populated repository and nested owner.
- `POST /issues/:id/comments` — Append a discussion comment to an issue thread.
- `PUT /issues/update/:id` — Update issue status (`open`/`closed`), title, description, or labels.
- `DELETE /issues/delete/:id` — Permanently delete an issue.

---

## 🎨 Design System

NexCode uses a custom dark developer theme:
- **Canvas**: `#090d16` with cyber radial glows.
- **Card Panels**: `#0f1523` / `#121829` with subtle border glassmorphism (`rgba(255, 255, 255, 0.08)`).
- **Accents**: Electric Sky Blue (`#0ea5e9`), Cyber Indigo (`#6366f1`), Emerald Green (`#10b981`), Amber (`#f59e0b`), and Rose (`#ef4444`).
- **Typography**: Inter / system monospace for clean code and git commit readability.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

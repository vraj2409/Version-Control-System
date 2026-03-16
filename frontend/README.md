# MPR Frontend

Personal Repository (MPR) - Frontend application built with React and Vite.

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will run at `http://localhost:5173`

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

## Features

- User authentication (Login/Signup)
- Repository management
- Commit history
- File uploads
- Real-time dashboard

## Project Structure

```
src/
├── components/
│   ├── Navbar.jsx
│   ├── auth/
│   │   ├── Login.jsx
│   │   └── Signup.jsx
│   ├── dashboard/
│   │   └── Dashboard.jsx
│   └── repo/
│       ├── CreateRepo.jsx
│       └── RepoDetail.jsx
├── App.jsx
├── authContext.jsx
├── Routes.jsx
└── main.jsx
```

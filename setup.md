# MemeX Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
# Install all dependencies for frontend, backend, and root
npm run install:all
```

### 2. Environment Setup

#### Backend (.env file in backend/ directory)
```bash
cd backend
cp env.example .env
# Edit .env with your Firebase credentials
```

Required environment variables:
- `FIREBASE_PROJECT_ID`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_CLIENT_EMAIL`
- `JWT_SECRET`
- `PORT` (default: 5000)
- `FRONTEND_URL` (default: http://localhost:3000)

#### Frontend (.env file in frontend/ directory)
```bash
cd frontend
cp env.example .env
# Edit .env with your Firebase web config
```

Required environment variables:
- `VITE_API_URL` (backend URL)
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

### 3. Start Development Servers

#### Option 1: Start Both (Recommended)
```bash
# From root directory
npm run dev
```

#### Option 2: Start Individually
```bash
# Frontend (port 3000)
npm run dev:frontend

# Backend (port 5000)
npm run dev:backend
```

### 4. Access Your App
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication (Email/Password + Google)
4. Enable Firestore Database
5. Enable Storage
6. Generate Admin SDK credentials
7. Get web app configuration

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   - Change ports in .env files
   - Kill processes using the ports

2. **Firebase Connection Issues**
   - Verify credentials in .env files
   - Check Firebase project settings

3. **Dependencies Issues**
   - Delete node_modules and package-lock.json
   - Run `npm run install:all` again

4. **CORS Issues**
   - Ensure FRONTEND_URL in backend .env matches frontend URL
   - Check that both servers are running

### Getting Help

- Check the main README.md
- Review CSS_CUSTOMIZATION.md for styling
- Check console logs for errors
- Verify all environment variables are set

## Development Workflow

1. **Frontend Changes**: Edit files in `frontend/src/`
2. **Backend Changes**: Edit files in `backend/src/`
3. **Styling**: Modify `frontend/src/styles/app.css`
4. **Configuration**: Update respective config files

## Production Build

```bash
# Build frontend
npm run build

# Start production backend
npm run start:backend
```

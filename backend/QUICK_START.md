# ⚡ Quick Start Guide

Get your Food Expiry Tracker running in 5 minutes!

## 🚀 One-Command Setup (After Initial Config)

### Terminal 1 - Backend
```bash
cd backend
npm install
# Create .env file (see below)
npm run dev
```

### Terminal 2 - Frontend  
```bash
cd frontend
npm install
# Create .env file (see below)
npm run dev
```

## 📝 Environment Files

### `backend/.env`
```env
PORT=5000
FRONTEND_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/food-expiry-tracker
JWT_SECRET=your-secret-key-here
GEMINI_API_KEY=optional-for-recipes
```

### `frontend/.env`
```env
VITE_API_URL=http://localhost:5000/api
```

## ✅ Verify It Works

1. Open `http://localhost:3000`
2. Login with any email
3. Add an item
4. Check inventory

## 🎯 That's It!

For detailed setup, see `SETUP.md`


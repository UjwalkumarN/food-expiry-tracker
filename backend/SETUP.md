# 🚀 Complete Setup Guide - Food Expiry Tracker

Follow these steps to get the application running end-to-end.

## Prerequisites

- **Node.js** v18 or higher ([Download](https://nodejs.org/))
- **MongoDB** - Choose one:
  - **Local MongoDB** ([Download](https://www.mongodb.com/try/download/community))
  - **MongoDB Atlas** (Free cloud database) ([Sign up](https://www.mongodb.com/cloud/atlas))

## Step 1: Clone/Download the Project

Make sure you have both `backend` and `frontend` folders.

## Step 2: Backend Setup

### 2.1 Install Backend Dependencies

```bash
cd backend
npm install
```

### 2.2 Configure Backend Environment

Create a `.env` file in the `backend` folder:

```bash
# Copy the example file
cp .env.example .env
```

Edit `backend/.env` and add your configuration:

```env
# Server Port
PORT=5000

# Frontend URL (change if your frontend runs on different port)
FRONTEND_URL=http://localhost:3000

# MongoDB Connection String
# For local MongoDB:
MONGODB_URI=mongodb://localhost:27017/food-expiry-tracker

# For MongoDB Atlas (replace with your connection string):
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/food-expiry-tracker

# JWT Secret (use a strong random string in production!)
JWT_SECRET=your-super-secret-jwt-key-change-this

# AI API Keys (Optional - for recipe suggestions)
# Get Gemini API key: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your-gemini-api-key-here

# OR use OpenAI instead
# Get OpenAI API key: https://platform.openai.com/api-keys
OPENAI_API_KEY=your-openai-api-key-here
```

### 2.3 Start MongoDB

**Option A: Local MongoDB**
```bash
# On Windows (if installed as service, it should auto-start)
# Or run manually:
mongod

# On Mac/Linux:
sudo systemctl start mongod
# OR
mongod
```

**Option B: MongoDB Atlas (Cloud)**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (free tier)
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Replace `<password>` with your database password
7. Add the connection string to `MONGODB_URI` in `.env`

### 2.4 Start Backend Server

```bash
cd backend
npm run dev
```

You should see:
```
✅ MongoDB connected successfully!
✅ Server running on port 5000
⏰ Starting expiry checker cron job (runs daily at 9 AM)
```

**Keep this terminal open!**

## Step 3: Frontend Setup

### 3.1 Install Frontend Dependencies

Open a **new terminal**:

```bash
cd frontend
npm install
```

### 3.2 Configure Frontend Environment

Create a `.env` file in the `frontend` folder:

```bash
# Create .env file
echo "VITE_API_URL=http://localhost:5000/api" > .env
```

Or manually create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3.3 Start Frontend Development Server

```bash
cd frontend
npm run dev
```

You should see:
```
VITE v6.x.x  ready in xxx ms

➜  Local:   http://localhost:3000/
```

**Keep this terminal open too!**

## Step 4: Access the Application

1. Open your browser
2. Go to `http://localhost:3000`
3. You should see the login page
4. Enter any email (e.g., `test@example.com`)
5. Click "Sign In"
6. You'll be automatically logged in and redirected to the dashboard

## ✅ Verification Checklist

- [ ] Backend server running on port 5000
- [ ] Frontend server running on port 3000
- [ ] MongoDB connected (check backend console)
- [ ] Can login with any email
- [ ] Dashboard loads without errors
- [ ] Can add products to inventory
- [ ] Barcode scanner works (or simulate scan)
- [ ] Recipe suggestions work (if API key configured)

## 🐛 Troubleshooting

### Backend won't start

**Error: "MongoDB connection error"**
- Check MongoDB is running: `mongod` or check MongoDB service
- Verify `MONGODB_URI` in `.env` is correct
- For Atlas: Check network access (IP whitelist) and connection string

**Error: "Port 5000 already in use"**
- Change `PORT` in `backend/.env` to another port (e.g., 5001)
- Update `VITE_API_URL` in frontend `.env` accordingly

**Error: "Cannot find module"**
- Run `npm install` again in backend folder
- Delete `node_modules` and `package-lock.json`, then `npm install`

### Frontend won't connect to backend

**Error: "Failed to fetch" or CORS error**
- Check backend is running
- Verify `VITE_API_URL` in `frontend/.env` matches backend URL
- Check `FRONTEND_URL` in `backend/.env` matches frontend URL
- Check browser console for detailed errors

**Error: "401 Unauthorized"**
- Clear browser localStorage: `localStorage.clear()` in browser console
- Try logging in again

### Recipe suggestions not working

- Check `GEMINI_API_KEY` or `OPENAI_API_KEY` is set in `backend/.env`
- Verify API key is valid and has credits
- Check backend console for API errors
- Fallback recipes will be generated if API fails

## 🎯 Quick Test

1. **Login**: Use any email
2. **Add Item**: Click "+ Add Item", fill form, submit
3. **View Inventory**: Go to Inventory page, see your item
4. **Scan Barcode**: Click "Scan Barcode", use "Simulate Scan" button
5. **Get Recipes**: Go to Recipes page, click "Get Recipe Suggestions"

## 📝 Notes

- The app **auto-creates users** on login (demo mode)
- Barcode lookup uses a **mock database** (can be extended)
- **Cron job** runs daily at 9 AM to check expiries
- **Notifications** are generated server-side
- All data is stored in **MongoDB**

## 🚀 Production Deployment

For production:
1. Set strong `JWT_SECRET`
2. Use MongoDB Atlas (cloud)
3. Set proper `FRONTEND_URL` (your domain)
4. Build frontend: `cd frontend && npm run build`
5. Build backend: `cd backend && npm run build`
6. Use PM2 or similar for process management

## 🎉 You're All Set!

Your Food Expiry Tracker is now running! Start adding items to your inventory and tracking expiry dates.


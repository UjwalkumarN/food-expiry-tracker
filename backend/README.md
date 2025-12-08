# Food Expiry Tracker - Full Stack Application

A complete food inventory management system with expiry tracking, barcode scanning, AI recipe suggestions, and automated notifications.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

```bash
cd frontend
npm install
# Create .env file with: VITE_API_URL=http://localhost:5000/api
npm run dev
```

The frontend will run on `http://localhost:3000` (or check vite.config.ts for port)

## 📁 Project Structure

```
food-expiry-tracker/
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── controllers/     # Request handlers
│   │   ├── jobs/            # Cron jobs (expiry checker)
│   │   ├── middleware/      # Auth middleware
│   │   ├── models/          # MongoDB models
│   │   ├── routes/          # API routes
│   │   └── server.ts        # Express server
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/      # React components
    │   ├── context/         # React contexts (Auth, Inventory)
    │   ├── pages/           # Page components
    │   ├── services/        # API services
    │   └── types.ts         # TypeScript types
    ├── package.json
    └── vite.config.ts
```

## ✨ Features

### ✅ Implemented Features

1. **User Authentication**
   - Email-based login (auto-creates user if doesn't exist)
   - JWT token-based authentication
   - Protected routes

2. **Inventory Management**
   - Add, update, delete products
   - Track expiry dates
   - Categorize items
   - Search and filter

3. **Barcode Scanner**
   - Scan barcodes using device camera
   - Lookup product information
   - Auto-fill product details

4. **Expiry Notifications**
   - Daily cron job checks expiry dates
   - Notifications for expired items
   - Warnings for items expiring in 3, 5, 7 days

5. **AI Recipe Suggestions**
   - Suggests recipes based on inventory
   - Prioritizes expiring items
   - Supports Gemini or OpenAI API

6. **Dashboard**
   - Visual statistics (charts)
   - Expired/expiring/fresh item counts
   - Category breakdown

## 🔧 Configuration

### Backend Environment Variables

Create `backend/.env`:

```env
PORT=5000
FRONTEND_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/food-expiry-tracker
JWT_SECRET=your-secret-key
GEMINI_API_KEY=your-gemini-key  # Optional
OPENAI_API_KEY=your-openai-key  # Optional
```

### Frontend Environment Variables

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `GET /api/auth/profile` - Get profile

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/products/expired` - Get expired items
- `GET /api/products/expiring-soon` - Get expiring items
- `GET /api/products/search?q=query` - Search

### Barcode
- `GET /api/barcode/lookup/:barcode` - Lookup barcode

### Recipes
- `POST /api/recipes/suggest` - Get AI recipes

### Notifications
- `GET /api/notifications` - Get notifications

## 🗄️ Database Models

### User
- name, email, password (hashed)
- createdAt

### Product
- name, barcode, category
- quantity, expiryDate, addedDate
- userId (reference to User)

## 🔐 Security

- Passwords are hashed using bcrypt
- JWT tokens for authentication
- CORS configured for frontend origin
- Protected routes with auth middleware

## 🚦 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Production Mode

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running locally, or
- Check MongoDB Atlas connection string
- Verify network access in Atlas if using cloud

### CORS Errors
- Check `FRONTEND_URL` in backend `.env` matches frontend URL
- Ensure frontend is running on the correct port

### API Connection Errors
- Verify `VITE_API_URL` in frontend `.env`
- Check backend is running and accessible
- Check browser console for detailed errors

### Recipe Suggestions Not Working
- Ensure `GEMINI_API_KEY` or `OPENAI_API_KEY` is set in backend `.env`
- Check API key is valid and has credits
- Fallback recipes will be generated if API fails

## 📝 Notes

- The app auto-creates users on login for demo purposes
- Barcode lookup uses a mock database (can be extended)
- Cron job runs daily at 9 AM to check expiries
- Notifications are generated server-side

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License

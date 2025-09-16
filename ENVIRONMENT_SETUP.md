# 🔧 Environment Setup Guide

## 📋 **Required Environment Variables**

### **Backend Environment (.env)**

Copy `backend/ENV_SAMPLE` to `backend/.env` and configure:

```bash
# Copy the sample file
cp backend/ENV_SAMPLE backend/.env
```

**Required Variables:**
```env
# Server Configuration
PORT=5000
MONGO_URI=mongodb://localhost:27017/stadipass
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CORS_ORIGINS=http://localhost:3001,http://localhost:5173,http://localhost:3000
APP_VERSION=dev
ADMIN_EMAIL=admin@stadipass.com
ADMIN_PASSWORD=admin123456
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=30d
APP_BASE_URL=http://localhost:5000

# Email Configuration (for production)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# OAuth Configuration (get from providers)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### **Frontend Environment (.env)**

Copy `frontend/ENV_SAMPLE` to `frontend/.env` and configure:

```bash
# Copy the sample file
cp frontend/ENV_SAMPLE frontend/.env
```

**Required Variables:**
```env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# OAuth Configuration (get from providers)
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_GITHUB_CLIENT_ID=your-github-client-id
```

---

## 🚀 **Quick Start (Development)**

### **1. Backend Setup**
```bash
cd backend
cp ENV_SAMPLE .env
# Edit .env with your values
npm install
npm run build
npm run dev
```

### **2. Frontend Setup**
```bash
cd frontend
cp ENV_SAMPLE .env
# Edit .env with your values
npm install
npm run dev
```

### **3. Database Setup**
```bash
# Start MongoDB (Docker)
docker run -d --name mongo -p 27017:27017 mongo:6

# Or use local MongoDB
mongod --dbpath /path/to/your/db
```

---

## 🔐 **OAuth Setup**

### **Google OAuth Setup**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Set application type to "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3001/auth/callback`
   - `http://localhost:5173/auth/callback`
7. Copy Client ID and Client Secret to your `.env` files

### **GitHub OAuth Setup**

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in:
   - Application name: "StadiPass"
   - Homepage URL: `http://localhost:3001`
   - Authorization callback URL: `http://localhost:3001/auth/callback`
4. Copy Client ID and Client Secret to your `.env` files

---

## 📧 **Email Setup (Optional for Development)**

For development, emails are logged to console. For production:

### **Gmail Setup**
1. Enable 2-factor authentication
2. Generate an "App Password"
3. Use your Gmail and app password in SMTP settings

### **Other SMTP Providers**
- **SendGrid**: Use their SMTP settings
- **Mailgun**: Use their SMTP settings
- **AWS SES**: Use their SMTP settings

---

## 🧪 **Testing the Setup**

### **1. Test Backend**
```bash
cd backend
npm run test
```

### **2. Test Frontend**
```bash
cd frontend
npm run test
```

### **3. Test Complete Flow**
```bash
# Start backend
cd backend && npm run dev

# Start frontend
cd frontend && npm run dev

# Test in browser
open http://localhost:3001
```

---

## 🔍 **Environment Validation**

### **Backend Health Check**
```bash
curl http://localhost:5000/health
```

### **Frontend Health Check**
```bash
curl http://localhost:3001
```

### **OAuth Test**
1. Go to login page
2. Check if OAuth buttons are enabled/disabled correctly
3. Click buttons to test redirects

---

## ⚠️ **Important Notes**

1. **Never commit `.env` files** - they contain sensitive information
2. **Use different secrets for production** - never use development secrets in production
3. **OAuth redirect URLs must match exactly** - including protocol and port
4. **CORS origins must include your frontend URL** - add all possible frontend URLs
5. **MongoDB must be running** - backend won't start without database connection

---

## 🐛 **Troubleshooting**

### **Backend Issues**
- **MongoDB connection failed**: Start MongoDB service
- **Port already in use**: Change PORT in .env or kill existing process
- **JWT secret missing**: Set JWT_SECRET in .env

### **Frontend Issues**
- **API connection failed**: Check VITE_API_URL in .env
- **OAuth buttons disabled**: Check OAuth client IDs in .env
- **Build errors**: Check TypeScript errors and fix

### **OAuth Issues**
- **Invalid redirect URI**: Check OAuth app settings match your URLs
- **Client ID not found**: Verify client IDs in both frontend and backend .env
- **CORS errors**: Add frontend URL to CORS_ORIGINS in backend .env

---

## 📚 **Next Steps**

1. Set up OAuth providers (Google, GitHub)
2. Configure email service for production
3. Set up production database
4. Deploy to staging/production
5. Monitor logs and performance

**Status: ✅ Ready for OAuth setup and testing**

# Vercel Deployment Setup Guide

## Critical Configuration Needed

### 🔴 Frontend Environment Variables (MUST SET IN VERCEL)

Your frontend is currently trying to connect to local API URLs which causes 10-second timeouts and loading issues.

**Go to your Vercel Frontend Project → Settings → Environment Variables**

Add this variable:

| Name | Value | Environment |
|------|-------|-------------|
| `REACT_APP_API_URL` | `https://your-backend-project.vercel.app/api` | Production |

**Replace `your-backend-project.vercel.app` with your actual backend Vercel URL**

### 📝 How to Find Your Backend URL:

1. Go to Vercel Dashboard
2. Open your **backend** project
3. Copy the deployment URL (e.g., `https://current-details-backend.vercel.app`)
4. Add `/api` at the end
5. Use this full URL as `REACT_APP_API_URL` in frontend environment variables

### 🔴 Backend Environment Variables (MUST BE SET)

**Go to your Vercel Backend Project → Settings → Environment Variables**

Add these variables:

| Name | Value | Environment |
|------|-------|-------------|
| `MONGODB_URI` | Your MongoDB Atlas connection string | Production |
| `JWT_SECRET` | Your JWT secret key | Production |
| `NODE_ENV` | `production` | Production |

### ⚡ After Setting Variables:

1. **Redeploy** both frontend and backend projects in Vercel
2. Clear your browser cache
3. Test the application

### 🔍 Common Issues:

**Problem: "Failed to fetch items" or infinite loading**
- ✅ Check `REACT_APP_API_URL` is set correctly in frontend
- ✅ Verify backend URL is accessible
- ✅ Check browser console for CORS errors

**Problem: "Authentication failed"**
- ✅ Verify `JWT_SECRET` is set in backend
- ✅ Check `MONGODB_URI` is correct

**Problem: Images not loading**
- ✅ This is already fixed in the latest deployment
- ✅ May need to re-upload images created before the fix

### 📊 Testing Checklist:

- [ ] Frontend loads without timeout
- [ ] Can login successfully
- [ ] Dashboard shows items
- [ ] Images display correctly
- [ ] Can create new items
- [ ] Can edit/delete items (if admin/super_admin)

### 🚀 Quick Test:

Open browser console (F12) and check:
```javascript
// Should show your backend URL
console.log('API URL:', process.env.REACT_APP_API_URL);
```

If it shows `undefined` or local URL, the environment variable is not set properly in Vercel.

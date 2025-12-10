# Troubleshooting Guide - Vercel Deployment Issues

## Current Error: CORS Preflight 500 Error

### Error Message:
```
[Error] Preflight response is not successful. Status code: 500
[Error] XMLHttpRequest cannot load https://current-details-notq.vercel.app/api/auth/verify due to access control checks.
```

### What This Means:
Your frontend is trying to call your backend, but the backend is returning a 500 error before it can even process the CORS preflight request. This usually means:

1. **Missing Environment Variables** - JWT_SECRET or MONGODB_URI not set
2. **Database Connection Failed** - MongoDB can't be reached
3. **Backend Crash on Startup** - Code error preventing server from starting

---

## 🔴 IMMEDIATE FIX STEPS

### Step 1: Check Backend Logs in Vercel

1. Go to **Vercel Dashboard** → Your **Backend** Project
2. Click **Deployments** → Click on the latest deployment
3. Click **View Function Logs**
4. Look for errors like:
   - `❌ CRITICAL: JWT_SECRET is not set`
   - `❌ CRITICAL: MONGODB_URI is not set`
   - `Database connection failed`

### Step 2: Set Required Environment Variables

**Go to Backend Project → Settings → Environment Variables**

Add these THREE variables:

| Variable Name | Value | Where to Get It |
|--------------|-------|-----------------|
| `JWT_SECRET` | `your_super_secret_jwt_key_change_this_in_production` | Use a strong random string |
| `MONGODB_URI` | `mongodb+srv://username:password@cluster.mongodb.net/dbname` | From MongoDB Atlas |
| `NODE_ENV` | `production` | Type exactly as shown |

### Step 3: Generate a Secure JWT_SECRET

Run this in your terminal:
```bash
# Generate a secure random JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the output and use it as your `JWT_SECRET`.

### Step 4: Get MongoDB URI

1. Go to **MongoDB Atlas** → Your Cluster
2. Click **Connect** → **Connect your application**
3. Copy the connection string
4. Replace `<password>` with your actual password
5. Replace `myFirstDatabase` with your database name (e.g., `premotions`)

Example:
```
mongodb+srv://myuser:mypassword@cluster.mongodb.net/premotions?retryWrites=true&w=majority
```

### Step 5: Redeploy Backend

1. After setting environment variables
2. Go to **Deployments** tab
3. Click **•••** on latest deployment
4. Click **Redeploy**
5. Wait 1-2 minutes

### Step 6: Test Backend Health

Open this URL in browser (replace with your backend URL):
```
https://your-backend-url.vercel.app/health
```

You should see:
```json
{
  "success": true,
  "message": "Server is running properly",
  "environment": "production",
  "config": {
    "jwt": "configured",
    "mongodb": "configured"
  }
}
```

If you see `"jwt": "missing"` or `"mongodb": "missing"`, the environment variables are not set correctly.

---

## 🟡 FRONTEND CONFIGURATION

### Set Frontend Environment Variable

**Go to Frontend Project → Settings → Environment Variables**

Add this variable:

| Variable Name | Value | Example |
|--------------|-------|---------|
| `REACT_APP_API_URL` | Your backend URL + `/api` | `https://your-backend.vercel.app/api` |

**Important:** Do NOT include a trailing slash!

✅ Correct: `https://backend.vercel.app/api`  
❌ Wrong: `https://backend.vercel.app/api/`

### Redeploy Frontend

1. After setting the environment variable
2. Go to **Deployments** tab
3. Click **•••** on latest deployment
4. Click **Redeploy**

---

## 🟢 VERIFICATION STEPS

### 1. Test Backend Directly

```bash
# Test health endpoint
curl https://your-backend-url.vercel.app/health

# Test root endpoint
curl https://your-backend-url.vercel.app/
```

### 2. Test CORS

```bash
# Test OPTIONS preflight
curl -X OPTIONS https://your-backend-url.vercel.app/api/auth/verify-token \
  -H "Origin: https://your-frontend-url.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization" \
  -v
```

Should return status 200 or 204, NOT 500.

### 3. Check Frontend Browser Console

1. Open your frontend URL
2. Press **F12** → **Console** tab
3. Look for:
   - Network errors showing the actual API URL being called
   - CORS errors
   - 500 errors

### 4. Check Network Tab

1. Press **F12** → **Network** tab
2. Reload page
3. Look for failed requests (red)
4. Click on failed request
5. Check **Headers** and **Response** tabs

---

## 📋 COMMON ISSUES & SOLUTIONS

### Issue 1: "JWT_SECRET is not set"

**Solution:** 
- Add `JWT_SECRET` environment variable in Vercel backend settings
- Redeploy backend

### Issue 2: "Database connection failed"

**Solution:**
- Check `MONGODB_URI` is correct
- Verify MongoDB Atlas allows connections from `0.0.0.0/0` (all IPs)
- Check database username/password are correct
- Ensure database user has read/write permissions

### Issue 3: Frontend shows "Network Error"

**Solution:**
- Set `REACT_APP_API_URL` in frontend Vercel settings
- Value should be your backend URL + `/api`
- Redeploy frontend

### Issue 4: CORS error after setting everything

**Solution:**
- Clear browser cache (Ctrl+Shift+Delete)
- Try incognito/private window
- Check backend logs for actual error
- Verify both projects are deployed (not failed)

### Issue 5: "Cannot read properties of undefined"

**Solution:**
- This means frontend can't reach backend
- Verify `REACT_APP_API_URL` is set
- Check URL doesn't have typos
- Ensure backend is actually running

---

## 🔍 DEBUG CHECKLIST

Use this checklist to verify everything:

**Backend:**
- [ ] Backend project deployed successfully on Vercel
- [ ] `JWT_SECRET` environment variable is set
- [ ] `MONGODB_URI` environment variable is set
- [ ] `NODE_ENV` is set to `production`
- [ ] `/health` endpoint returns 200
- [ ] Backend logs show no errors
- [ ] MongoDB Atlas allows connections from all IPs

**Frontend:**
- [ ] Frontend project deployed successfully on Vercel
- [ ] `REACT_APP_API_URL` environment variable is set
- [ ] API URL ends with `/api` (no trailing slash)
- [ ] API URL uses `https://` not `http://`
- [ ] Frontend loads without timeout
- [ ] Browser console shows correct API URL

**Testing:**
- [ ] Can access backend `/health` endpoint
- [ ] Can register new user
- [ ] Can login
- [ ] Dashboard loads
- [ ] Images display
- [ ] No CORS errors in console

---

## 🆘 STILL NOT WORKING?

### Get Detailed Logs

1. **Backend Logs:**
   - Vercel Dashboard → Backend Project → Deployments → Latest → View Function Logs
   - Look for the FIRST error that appears

2. **Frontend Console:**
   - Open frontend → F12 → Console
   - Copy ALL red errors
   - Screenshot the Network tab showing failed requests

3. **Environment Variables:**
   - Screenshot your backend environment variables (hide sensitive values)
   - Verify spelling matches exactly: `JWT_SECRET`, `MONGODB_URI`, `NODE_ENV`

### Contact Information

Provide these details when asking for help:
- Backend URL: `https://your-backend.vercel.app`
- Frontend URL: `https://your-frontend.vercel.app`
- Backend logs (first 50 lines)
- Frontend console errors
- Screenshots of Network tab failed requests

---

## 📚 Additional Resources

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [MongoDB Atlas IP Whitelist](https://docs.atlas.mongodb.com/security/ip-access-list/)
- [CORS Explained](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

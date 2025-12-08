# Vercel Deployment Guide for Continue Offers RBAC System

## Prerequisites
1. Install Vercel CLI: `npm install -g vercel`
2. Create a Vercel account at https://vercel.com

## Deployment Steps

### 1. Deploy Backend (API)
```bash
cd backend
vercel --prod
```

**Environment Variables to Add in Vercel Dashboard:**
- `NODE_ENV=production`
- `MONGODB_URI=<your-mongodb-connection-string>`
- `JWT_SECRET=<your-secret-key>`
- `JWT_EXPIRE=7d`
- `HOST=0.0.0.0`

### 2. Deploy Frontend
```bash
cd frontend
vercel --prod
```

**Environment Variables to Add in Vercel Dashboard:**
- `REACT_APP_API_URL=<your-backend-vercel-url>/api`

### 3. Update CORS in Backend

After deploying frontend, update `backend/server.js` CORS configuration:

```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'https://your-frontend-vercel-url.vercel.app'
];
```

Redeploy backend after updating CORS.

### 4. Test Deployment

1. Visit your frontend URL
2. Register/Login
3. Create packages
4. Test all features

## Important Notes

- **MongoDB Atlas**: Ensure your MongoDB Atlas allows connections from anywhere (0.0.0.0/0) or add Vercel IPs
- **File Uploads**: Consider using cloud storage (Cloudinary, AWS S3) instead of local uploads
- **Environment Variables**: Never commit .env files to git
- **Separate Deployments**: Frontend and backend are deployed separately on Vercel

## Alternative: Deploy Backend Elsewhere

Vercel has limitations for backend with file uploads. Consider:
- **Railway**: https://railway.app
- **Render**: https://render.com
- **Heroku**: https://heroku.com

These platforms better support file uploads and persistent storage.

## Quick Deploy Commands

```bash
# Backend
cd backend
vercel --prod

# Frontend (after getting backend URL)
cd frontend
vercel --prod
```

## Post-Deployment Checklist

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] Environment variables configured
- [ ] CORS updated with frontend URL
- [ ] MongoDB Atlas whitelist updated
- [ ] Test login functionality
- [ ] Test package creation
- [ ] Test file uploads
- [ ] Test user management

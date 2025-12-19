# Netlify Deployment Guide for ErrandBit

## 🚀 Deployment Status

Your ErrandBit frontend is configured for Netlify deployment!

## ✅ Files Created

1. **netlify.toml** - Main configuration file (root directory)
2. **frontend/public/_redirects** - SPA routing rules
3. **frontend/public/robots.txt** - SEO configuration

## 🔧 Netlify Configuration Steps

### 1. **Connect Repository to Netlify**
   - Log in to [Netlify](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Select your GitHub repository: `comwanga/ErrandBit`
   - Netlify will auto-detect the `netlify.toml` configuration

### 2. **Environment Variables** (CRITICAL)
   
   Go to **Site settings → Environment variables** and add:

   ```
   VITE_API_BASE=https://your-backend-api.com
   VITE_API_URL=https://your-backend-api.com
   VITE_MAPBOX_TOKEN=your_actual_mapbox_token
   VITE_NODE_ENV=production
   NODE_VERSION=20
   ```

   **⚠️ IMPORTANT:** Without `VITE_API_BASE`, the frontend will try to connect to localhost and fail!

### 3. **Build Settings** (Auto-configured via netlify.toml)
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `frontend/dist`
   - **Node version:** 20

### 4. **Deploy**
   - Click "Deploy site"
   - Wait for build to complete (2-3 minutes)
   - Your site will be live at `https://[random-name].netlify.app`

## 🔍 Common Issues & Solutions

### Issue 1: "Page Not Found" on refresh
**Cause:** Missing SPA redirects  
**Solution:** ✅ Already fixed with `_redirects` file

### Issue 2: "Cannot connect to API" or blank page
**Cause:** Missing environment variables  
**Solution:** Add `VITE_API_BASE` and `VITE_API_URL` in Netlify settings

### Issue 3: Build fails with "command not found"
**Cause:** Wrong base directory  
**Solution:** ✅ Already configured in `netlify.toml` (base = "frontend")

### Issue 4: PWA icons missing
**Cause:** Icons not in `/public` folder  
**Action needed:** Add these files to `frontend/public/`:
   - `icon-192x192.png`
   - `icon-512x512.png`
   - `favicon.ico`
   - `screenshot-mobile.png`

## 📝 Verification Checklist

After deployment, test:
- [ ] Homepage loads correctly
- [ ] React Router navigation works (try /jobs, /profile, etc.)
- [ ] Refreshing on any route works (no 404)
- [ ] API calls work (check browser console for errors)
- [ ] PWA manifest loads (check DevTools → Application → Manifest)

## 🔗 Backend Setup (Required)

Your frontend needs a backend API. Options:

1. **Deploy backend separately:**
   - Heroku, Render, Railway, or DigitalOcean
   - Update `VITE_API_BASE` with backend URL

2. **Use Docker images from GHCR:**
   - Your CI/CD already builds: `ghcr.io/comwanga/errandbit/backend:main`
   - Deploy to any container platform

3. **Local development:**
   - Keep `VITE_API_BASE=http://localhost:4000` (development only)

## 🎯 Next Steps

1. **Commit and push** these new files:
   ```bash
   git add netlify.toml frontend/public/_redirects frontend/public/robots.txt
   git commit -m "Add Netlify deployment configuration"
   git push origin main
   ```

2. **Configure Netlify** with environment variables (see step 2 above)

3. **Deploy backend** to get an API URL

4. **Test thoroughly** using the verification checklist

## 🆘 Still Not Working?

Check Netlify build logs:
1. Go to Netlify dashboard → Your site → Deploys
2. Click the failed deploy
3. Read the build log for specific errors
4. Common fixes:
   - Clear cache and retry deploy
   - Check Node version matches (20)
   - Verify all env variables are set

## 📚 Resources

- [Netlify Docs](https://docs.netlify.com)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html#netlify)
- [React Router and Netlify](https://ui.dev/react-router-cannot-get-url-refresh)

---

**Status:** Frontend is now Netlify-ready! ✨

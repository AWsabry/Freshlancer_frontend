# Deployment Guide

This guide will help you prepare and deploy the Freshlancer frontend application.

## Prerequisites

- Node.js 18+ installed
- Production API URL ready
- Build environment configured

## Step 1: Set Environment Variables

Create a `.env.production` file in the root directory with your production API URL:

```env
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_ENCRYPTION_KEY=your-32-character-encryption-key-here
```

**Important:**
- `VITE_API_BASE_URL` is **required** for production builds
- Do NOT include trailing slash in the URL
- `VITE_ENCRYPTION_KEY` is optional but recommended for production

## Step 2: Build the Application

Run the build command:

```bash
npm run build
```

This will create a `dist` folder containing:
- `index.html` (main entry point)
- `assets/` folder (JavaScript, CSS, and other assets)

## Step 3: Verify Build Output

Check that the `dist` folder contains:
- ✅ `index.html` file in the root
- ✅ `assets/` folder with JS and CSS files
- ✅ Any static files from `public/` folder

## Step 4: Deploy the `dist` Folder

Upload the entire contents of the `dist` folder to your hosting provider.

### Deployment Options:

#### Option A: Static Hosting (Netlify, Vercel, GitHub Pages)
- Upload the `dist` folder contents
- The `_redirects` file (for Netlify) or server configuration will handle SPA routing

#### Option B: Apache Server
- Upload `dist` folder contents to your web root
- The `.htaccess` file will handle SPA routing automatically

#### Option C: Nginx Server
Configure your Nginx server with:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff|woff2|ttf|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### Option D: Traditional Web Hosting
- Upload all files from `dist` folder to your web root (usually `public_html` or `www`)
- Ensure your server supports SPA routing (configure redirects to `index.html`)

## Step 5: Verify Deployment

1. Visit your deployed URL
2. Check browser console for errors
3. Test authentication flow
4. Verify API connectivity
5. Test all major features

## Troubleshooting

### Build Errors

If you get an error about `VITE_API_BASE_URL`:
- Ensure `.env.production` file exists
- Check that the variable is set correctly
- Restart your terminal/IDE after creating the file

### API Connection Issues

- Verify `VITE_API_BASE_URL` is set to the correct production API URL
- Check CORS settings on your backend API
- Ensure the API URL doesn't have a trailing slash

### Routing Issues (404 errors on refresh)

- Ensure your server is configured to serve `index.html` for all routes
- Check that `_redirects` (Netlify) or `.htaccess` (Apache) is in the `dist` folder
- For Nginx, verify the `try_files` directive is configured

### Assets Not Loading

- Check that all files from `dist` folder are uploaded
- Verify file paths are correct (case-sensitive on Linux servers)
- Check browser console for 404 errors

## Production Checklist

Before deploying, ensure:

- [ ] `.env.production` file is created with correct API URL
- [ ] Build completes without errors (`npm run build`)
- [ ] `dist/index.html` exists
- [ ] All environment variables are set
- [ ] API URL is correct and accessible
- [ ] CORS is configured on backend
- [ ] HTTPS is enabled (recommended)
- [ ] Error monitoring is set up (optional but recommended)

## Notes

- The build output is in the `dist` folder
- `index.html` is always included in the build (this is Vite's default behavior)
- Environment variables must start with `VITE_` to be accessible in the app
- The proxy configuration in `vite.config.js` is only used during development


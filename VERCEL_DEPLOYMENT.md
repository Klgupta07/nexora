# 🚀 CHILLMODE – Vercel 1-Click Deployment Guide

CHILLMODE is fully configured and ready for **1-click deployment on [Vercel](https://vercel.com)** with:
- **Fast Global Edge CDN** for the Vite/React PWA frontend.
- **Serverless Functions** via `@vercel/node` for the Node.js/Express API (`/api/*`).
- **100% Offline PWA & Caching Headers** preconfigured for `/sw.js` and `/manifest.json`.
- **Lambda-Safe Storage**: Serverless database writes automatically use `os.tmpdir()`.

---

## ⚡ Option 1: Deploy via Vercel Web Dashboard (Recommended)

### Step 1: Push Project to GitHub / GitLab / Bitbucket
Initialize Git in this directory if not already done, commit, and push to your repository:
```bash
git init
git add .
git commit -m "feat: CHILLMODE full-stack offline PWA with Vercel configuration"
git branch -M main
git remote add origin https://github.com/<your-username>/chillmode.git
git push -u origin main
```

### Step 2: Import Project in Vercel
1. Go to [https://vercel.com/new](https://vercel.com/new) and log in.
2. Under **"Import Git Repository"**, select your `chillmode` repo and click **Import**.
3. **Project Settings**:
   - **Framework Preset**: *Vite* (or *Other*).
   - **Root Directory**: `./` (leave as default root).
   - **Build Command**: `npm run build` (detected automatically from `vercel.json`).
   - **Output Directory**: `frontend/dist` (detected automatically from `vercel.json`).
4. Click **Deploy**.

Within 60–90 seconds, your site will be live at `https://chillmode-<your-username>.vercel.app`! 🎉

---

## 💻 Option 2: Deploy via Vercel CLI

If you prefer deploying directly from your terminal:

1. Install the Vercel CLI (or run with npx):
   ```bash
   npx vercel
   ```
2. Follow the interactive prompts:
   - **Set up and deploy?** $\rightarrow$ `Y`
   - **Which scope?** $\rightarrow$ Select your account
   - **Link to existing project?** $\rightarrow$ `N`
   - **Project name?** $\rightarrow$ `chillmode`
   - **In which directory?** $\rightarrow$ `./`
3. To deploy directly to production:
   ```bash
   npx vercel --prod
   ```

---

## ⚙️ Environment Configuration (Optional)

In your Vercel Project Settings $\rightarrow$ **Environment Variables**, you can optionally set:

| Variable | Description | Default (if unset) |
|---|---|---|
| `NODE_ENV` | Runtime environment | `production` |
| `JWT_SECRET` | Secret key for auth tokens | Auto-generated secure fallback |
| `PORT` | Local port (not used in Serverless) | `5000` |

---

## 📱 Mobile & Offline Features on Vercel
- When you open the Vercel URL on mobile (iOS Safari / Android Chrome), tap **"Add to Home Screen"** or **"Install CHILLMODE"** to install it as a standalone app.
- Click the **"Prepare Offline"** button in the top bar to cache your favourite tracks directly to device storage.

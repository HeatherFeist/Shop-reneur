<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Shop'reneur — Professional Incubator

Strategic management hub for store owners and customers, built with React + Vite + Supabase.

🌐 **Live site:** https://shopreneur-7bfa7.web.app

## 🚀 Automatic Deployment (Firebase Hosting)

This repo is wired up for **zero-touch deploys** via GitHub Actions:

| Event | What happens |
|---|---|
| Push / merge to `main` | ✅ Deploys automatically to the **live site** |
| Open a Pull Request | 🔍 Deploys a temporary **preview URL** (posted as a PR comment) |

### One-time setup — add the Firebase service account secret

You only need to do this **once**. After that, every push to `main` goes live automatically.

1. Go to the [Firebase Console](https://console.firebase.google.com) → select project **smart-hub7fba7**
2. Click ⚙️ **Project Settings** → **Service accounts** tab
3. Click **Generate new private key** → download the JSON file
4. Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions**
5. Click **New repository secret** and add:
   - **Name:** `FIREBASE_SERVICE_ACCOUNT_SMART_HUB7FBA7`
   - **Value:** paste the entire contents of the downloaded JSON file

That's it! The next push to `main` will deploy live. 🎉

> **Optional:** Add `GEMINI_API_KEY` as a secret the same way if you want the AI features enabled in production builds.

---

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```
   npm install
   ```
2. *(Optional)* Set `GEMINI_API_KEY` in a `.env.local` file for AI features:
   ```
   GEMINI_API_KEY=your_key_here
   ```
3. Run the app:
   ```
   npm run dev
   ```

> **No extra Supabase setup needed to run locally.** The app connects to the project's Supabase instance automatically. If Supabase is unreachable the app falls back to browser localStorage so you can still add and manage products.

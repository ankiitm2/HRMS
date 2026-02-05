# Deployment Guide

## 1. Backend (Render / Railway)

The backend is configured for deployment on PaaS services like Render.com or Railway.app.

### Deployment Steps:
1.  Push code to GitHub.
2.  Create a new **Web Service** on Render/Railway connected to your repo.
3.  Set **Root Directory** to `backend`.
4.  Set **Build Command** to `pip install -r requirements.txt`.
5.  Set **Start Command** to `gunicorn hrms_backend.wsgi:application`.
6.  Add Environment Variables:
    - `PYTHON_VERSION`: `3.11.0` (or similar)
    - `DEBUG`: `False`
7.  Deploy!

Once deployed, copy the **Backend URL** (e.g., `https://hrms-backend.onrender.com`).

---

## 2. Frontend (Vercel)

The frontend is a Next.js app ready for Vercel deployment.

### Deployment Steps:
1.  Go to [Vercel.com](https://vercel.com) and import your GitHub repo.
2.  Set **Root Directory** to `frontend` (Edit the root directory option).
3.  Add Environment Variable:
    - Name: `NEXT_PUBLIC_API_URL`
    - Value: `https://YOUR-BACKEND-URL.onrender.com/api` (Make sure to append `/api` if your backend needs it, or just base URL depending on usage).
    *Note: In our code, we use `/api` prefix in URL or config. If your backend URL is `.../api`, set it accordingly.*
4.  Deploy!

Your frontend will now be live and connected to your backend.

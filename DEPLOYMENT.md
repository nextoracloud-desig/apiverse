# Deployment Guide for Render.com

This project is configured for deployment on Render. A `render.yaml` file has been added to the root directory to automate the setup using Render Blueprints.

## 1. Connect to Render
1. Go to your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** and select **Blueprint**.
3. Connect your GitHub repository.
4. Render will detect the `render.yaml` file and propose a new Web Service called `apiverse`.

## 2. Environment Variables
You MUST configure the following Environment Variables in the Render Dashboard (or during the Blueprint setup).

| Variable | Description | Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | Your Supabase connection string. Use port **5432** (Session mode) or **6543** (Transaction pooler) depending on your preference. | `postgres://user:pass@db.supabase.co:6543/postgres?pgbouncer=true` |
| `NEXTAUTH_URL` | **CRITICAL**: The exact URL of your deployed app. | `https://apiverse.onrender.com` |
| `NEXTAUTH_SECRET` | A long random string for encryption. | `openssl rand -base64 32` |
| `NODE_VERSION` | Node.js version to use. | `20.11.0` |
| `GOOGLE_CLIENT_ID` | (Optional) For Google Login. | `...` |
| `GOOGLE_CLIENT_SECRET` | (Optional) For Google Login. | `...` |
| `STRIPE_SECRET_KEY` | Stripe Backend Key. | `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook Secret (needs to be updated if endpoint changes). | `whsec_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Frontend Key. | `pk_test_...` |

## 3. Important Checks
- **Build Command**: `npm install && npm run build` (Pre-configured in `render.yaml`)
- **Start Command**: `npm start` (Pre-configured)
- **Runtime**: Dynamic routes are set to `nodejs` runtime by default now to support Supabase/Prisma.

## 4. Troubleshooting
If the build fails on Render but passes locally:
- Check if `DATABASE_URL` is accessible from Render (Supabase "Network Restrictions").
- Ensure `NEXTAUTH_URL` matches the Render URL exactly (no trailing slash).

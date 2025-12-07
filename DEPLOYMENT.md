# APIverse Deployment Guide

## Environment Variables
Ensure these are set in your deployment environment (Vercel, Railway, etc.):

```env
# Database
DATABASE_URL="file:./dev.db" # Or Postgres URL for production

# Authentication (NextAuth)
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-secret-key-min-32-chars"
GOOGLE_CLIENT_ID="optional"
GOOGLE_CLIENT_SECRET="optional"

# Stripe (Optional for testing, required for Payments)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLIC_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

## Commands
- **Install**: `npm install`
- **Database Init**: `npx prisma migrate deploy`
- **Build**: `npm run build`
- **Start**: `npm start`

## Production Notes
1.  **Webhooks**: Configure Stripe Webhooks to point to `https://your-domain.com/api/stripe/webhook`.
2.  **Health Checks**:
    - Setup a cron job to run `npx ts-node scripts/verifyAPIs.ts` daily to keep API health metrics fresh.
    - Or use a Vercel Cron function (requires refactoring script to API route).
3.  **Database**:
    - For production, switch `provider = "sqlite"` to `"postgresql"` in `prisma/schema.prisma` if high concurrency is expected.

## Support
For issues, check the `app/api/feedback` implementation or Next.js logs.

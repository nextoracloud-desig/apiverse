import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const path = req.nextUrl.pathname;

        // Premium Routes Gating
        // Removed /saved from here so free users can access it (logic in page handles auth)
        const premiumRoutes = ["/profile/usage", "/apiKeys"];
        const isPremiumRoute = premiumRoutes.some(route => path.startsWith(route));

        // If user is accessing a premium route but is on "free" plan
        if (isPremiumRoute && token?.plan === "free") {
            return NextResponse.redirect(new URL("/plans?upgrade=true", req.url));
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
);

export const config = {
    // Only run middleware on these protected paths
    // /explore and /api/[id] are NOT listed, so they remain public (handled by page code if needed)
    matcher: ["/dashboard/:path*", "/saved/:path*", "/keys/:path*", "/settings/:path*", "/profile/:path*"],
};

// temp fix to trigger deploy

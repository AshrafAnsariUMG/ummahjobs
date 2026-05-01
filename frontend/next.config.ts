import type { NextConfig } from "next";

// Content-Security-Policy — defense in depth on top of nginx headers (HSTS, X-Frame, etc.)
// Allows: Matomo (analytics.ummahmediagroup.com), Stripe, Bunny Fonts, UmmahPass OAuth.
// Adjust if new third-party scripts/styles are added.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://analytics.ummahmediagroup.com https://*.stripe.com https://js.stripe.com https://cdn77.aj2742.top https://*.aj2742.top",
  "style-src 'self' 'unsafe-inline' https://fonts.bunny.net https://fonts.googleapis.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' https://fonts.bunny.net https://fonts.gstatic.com data:",
  "connect-src 'self' https://analytics.ummahmediagroup.com https://api.stripe.com https://*.stripe.com https://ummahpass.io https://aj2742.top https://cdn77.aj2742.top https://*.aj2742.top",
  "frame-src https://*.stripe.com https://js.stripe.com https://aj2742.top https://*.aj2742.top",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://*.stripe.com",
  "frame-ancestors 'self'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self), interest-cohort=()" },
        ],
      },
    ];
  },
};

export default nextConfig;

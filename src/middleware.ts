import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/stripe'
])

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect()
  }

  // ✅ Inject CSP header (ONLY this block added, NOTHING else changed)
  const res = NextResponse.next()
  res.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self';",
      "script-src 'self' https://js.stripe.com https://checkout.stripe.com 'unsafe-inline' 'unsafe-eval' blob:;",
      "frame-src https://js.stripe.com https://hooks.stripe.com https://checkout.stripe.com;",
      "connect-src https://api.stripe.com https://checkout.stripe.com;",
    ].join(" ")
  )
  return res
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}

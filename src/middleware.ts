import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/stripe'
])

export default clerkMiddleware(async (auth, req) => {
  const res = NextResponse.next()

  // 🔐 Protect non-public routes
  if (!isPublicRoute(req)) {
    await auth.protect()
  }

  // ⚔️ Inject CSP for Stripe
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
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}

import { NextResponse } from 'next/server'

/**
 * Rate limiting store (in-memory, Edge-compatible)
 * Note: This resets on each Edge function cold start
 * For production, consider using Vercel KV or Redis
 */
const rateLimitStore = new Map()

/**
 * Common bot user-agent patterns to block
 */
const BOT_PATTERNS = [
  'bot',
  'crawler',
  'spider',
  'scraper',
  'curl',
  'wget',
  'python-requests',
  'postman',
  'insomnia',
  'httpie',
  'go-http-client',
  'java/',
  'apache-httpclient',
  'okhttp',
]

/**
 * Whitelisted user-agents (legitimate crawlers)
 */
const WHITELISTED_AGENTS = [
  'googlebot',
  'bingbot',
  'slurp', // Yahoo
  'duckduckbot',
  'baiduspider',
  'yandexbot',
  'facebookexternalhit',
  'twitterbot',
  'rogerbot',
  'linkedinbot',
  'embedly',
  'quora link preview',
  'showyoubot',
  'outbrain',
  'pinterest',
  'slackbot',
  'vkShare',
  'W3C_Validator',
]

/**
 * Check if user-agent is a bot
 */
function isBot(userAgent) {
  if (!userAgent) return true // No user-agent is suspicious

  const ua = userAgent.toLowerCase()

  // Check whitelist first
  if (WHITELISTED_AGENTS.some((agent) => ua.includes(agent))) {
    return false
  }

  // Check bot patterns
  return BOT_PATTERNS.some((pattern) => ua.includes(pattern))
}

/**
 * Simple rate limiting (10 requests per minute per IP)
 */
function checkRateLimit(ip) {
  const now = Date.now()
  const windowMs = 60 * 1000 // 1 minute
  const maxRequests = 10

  if (!rateLimitStore.has(ip)) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs })
    return true
  }

  const record = rateLimitStore.get(ip)

  // Reset if window expired
  if (now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs })
    return true
  }

  // Check if limit exceeded
  if (record.count >= maxRequests) {
    return false
  }

  // Increment count
  record.count++
  return true
}

/**
 * Get client IP address
 */
function getClientIP(request) {
  // Check various headers for IP (Vercel, Cloudflare, etc.)
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }

  // Fallback (shouldn't happen in production)
  return 'unknown'
}

/**
 * Public API routes that need rate limiting
 */
const PUBLIC_API_ROUTES = [
  '/api/orders/create',
  '/api/orders/',
  '/api/contact',
  '/api/stripe/create-checkout-session',
]

/**
 * Check if path is a public API route
 */
function isPublicAPIRoute(pathname) {
  return PUBLIC_API_ROUTES.some((route) => {
    if (route.endsWith('/')) {
      return pathname.startsWith(route)
    }
    return pathname === route
  })
}

export function middleware(request) {
  const { pathname } = request.nextUrl

  // Only apply to public API routes
  if (!isPublicAPIRoute(pathname)) {
    return NextResponse.next()
  }

  // Bot detection
  const userAgent = request.headers.get('user-agent')
  if (isBot(userAgent)) {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    )
  }

  // Rate limiting
  const clientIP = getClientIP(request)
  if (!checkRateLimit(clientIP)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/orders/:path*',
    '/api/contact',
    '/api/stripe/:path*',
  ],
}




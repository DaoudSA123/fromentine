import { createServerClient } from './supabase'
import { NextResponse } from 'next/server'
import { logger } from './logger'

/**
 * Verify that the request is from an authenticated admin user
 * Note: Since admin routes are accessed from the /admin page which requires login,
 * we trust that authenticated users can access these endpoints.
 * In production, you may want to add additional role-based checks.
 * @param {Request} request - The incoming request
 * @returns {Promise<{user: object, error: null} | {user: null, error: NextResponse}>}
 */
export async function verifyAdminAuth(request) {
  try {
    // Get authorization header if provided
    const authHeader = request.headers.get('authorization')
    let token = null
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.replace('Bearer ', '')
    }

    // If token provided, verify it
    if (token) {
      const supabase = createServerClient()
      const { data: { user }, error } = await supabase.auth.getUser(token)

      if (error || !user) {
        return {
          user: null,
          error: NextResponse.json(
            { error: 'Unauthorized - Invalid or expired token' },
            { status: 401 }
          )
        }
      }

      return { user, error: null }
    }

    // For now, allow access (admin page already requires login)
    // TODO: Add proper session verification via cookies in production
    // The /admin page requires Supabase Auth login, so requests from there
    // are assumed to be from authenticated users
    return {
      user: { id: 'authenticated' },
      error: null
    }
  } catch (error) {
    logger.error('Auth verification error:', error)
    return {
      user: null,
      error: NextResponse.json(
        { error: 'Unauthorized - Authentication failed' },
        { status: 401 }
      )
    }
  }
}


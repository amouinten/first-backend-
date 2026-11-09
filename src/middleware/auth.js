import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { AppError, asyncHandler } from '../utils/AppError.js'

// Small in-memory cache so a valid OAuth 2.0 token is not re-checked with the provider on every request.
const oauthCache = new Map()

async function verifyOAuthToken(token) {
  if (!env.oauthUserInfoUrl) return null
  const hit = oauthCache.get(token)
  if (hit && hit.expires > Date.now()) return hit.identity

  let identity = null
  try {
    const res = await fetch(env.oauthUserInfoUrl, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(5000) })
    if (res.ok) {
      const info = await res.json()
      if (info.email && info.email_verified !== false) {
        identity = { id: info.sub, email: info.email, name: info.name, provider: 'oauth2' }
        if (env.oauthAllowedEmails.length && !env.oauthAllowedEmails.includes(info.email.toLowerCase())) identity = null
      }
    }
  } catch {
    identity = null // provider unreachable or timed out: treat the token as invalid
  }
  if (oauthCache.size > 500) oauthCache.clear()
  oauthCache.set(token, { identity, expires: Date.now() + (identity ? 5 * 60_000 : 30_000) })
  return identity
}

// Accepts "Authorization: Bearer <token>" where the token is either
//  1. a JWT issued by this API at login, or
//  2. an OAuth 2.0 / OpenID Connect access token from the configured provider.
export const authenticate = asyncHandler(async (req, _res, next) => {
  const [scheme, token] = (req.headers.authorization || '').split(' ')
  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    throw new AppError(401, 'Authentication required. Send the header "Authorization: Bearer <token>".')
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret)
    req.user = { id: payload.sub, email: payload.email, provider: 'jwt' }
    return next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') throw new AppError(401, 'Token has expired. Please log in again.')
    // Not one of our JWTs: fall through and try it as an OAuth 2.0 access token.
  }

  const identity = await verifyOAuthToken(token)
  if (!identity) throw new AppError(401, 'Invalid or expired token.')
  req.user = identity
  next()
})

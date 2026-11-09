import rateLimit from 'express-rate-limit'
import { env } from '../config/env.js'

const limiter = (limit, message) =>
  rateLimit({
    windowMs: env.rateWindowMs,
    limit,
    standardHeaders: 'draft-7', // sends RateLimit-* headers
    legacyHeaders: false,
    handler: (_req, res) => res.status(429).json({ success: false, error: { status: 429, message } }),
  })

const minutes = Math.round(env.rateWindowMs / 60000)

// General limit for every /api route.
export const apiLimiter = limiter(env.rateMax, `Too many requests. Limit is ${env.rateMax} per ${minutes} minutes. Try again later.`)
// Stricter limit for login attempts (slows down brute-force attacks).
export const loginLimiter = limiter(env.loginRateMax, `Too many login attempts. Limit is ${env.loginRateMax} per ${minutes} minutes. Try again later.`)

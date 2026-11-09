import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { User } from '../models/User.js'
import { env } from '../config/env.js'
import { AppError, asyncHandler } from '../utils/AppError.js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const isText = (v) => typeof v === 'string' && v.trim().length > 0

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body ?? {}
  const errors = {}
  if (!isText(name) || name.trim().length < 2) errors.name = 'name is required (at least 2 characters)'
  if (!isText(email) || !EMAIL_RE.test(email.trim())) errors.email = 'a valid email is required'
  if (typeof password !== 'string' || password.length < 8) errors.password = 'password is required (at least 8 characters)'
  if (Object.keys(errors).length) throw new AppError(400, 'Validation failed', errors)

  const normalized = email.trim().toLowerCase()
  if (await User.exists({ email: normalized })) throw new AppError(409, 'An account with this email already exists')

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await User.create({ name: name.trim(), email: normalized, passwordHash })
  res.status(201).json({ success: true, data: { user } })
})

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body ?? {}
  if (!isText(email) || typeof password !== 'string' || !password) {
    throw new AppError(400, 'Validation failed', { ...(!isText(email) && { email: 'email is required' }), ...(!password && { password: 'password is required' }) })
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+passwordHash')
  // Same message for an unknown email and a wrong password, so attackers cannot find which emails exist.
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) throw new AppError(401, 'Invalid email or password')

  const token = jwt.sign({ sub: user.id, email: user.email }, env.jwtSecret, { expiresIn: env.jwtExpiresIn })
  res.status(200).json({ success: true, data: { token, tokenType: 'Bearer', expiresIn: env.jwtExpiresIn, user } })
})

// GET /api/auth/me  (protected): shows who the token belongs to, for JWTs and OAuth 2.0 tokens alike.
export const me = (req, res) => res.status(200).json({ success: true, data: { user: req.user } })

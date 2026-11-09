import { AppError } from '../utils/AppError.js'
import { env } from '../config/env.js'

export const notFound = (req, _res, next) => next(new AppError(404, `Route not found: ${req.method} ${req.originalUrl}`))

// Every error leaves the API in the same shape: { success: false, error: { status, message, details? } }
export function errorHandler(err, _req, res, _next) {
  let status = 500
  let message = 'Internal server error'
  let details

  if (err instanceof AppError) {
    ;({ status, message, details } = err)
  } else if (err.name === 'ValidationError') {
    status = 400
    message = 'Validation failed'
    details = Object.fromEntries(
      Object.entries(err.errors).map(([field, e]) => [field, e.name === 'CastError' ? `${field} must be a valid ${String(e.kind).toLowerCase()}` : e.message]),
    )
  } else if (err.name === 'CastError') {
    status = 400
    message = `Invalid value for ${err.path}`
  } else if (err.code === 11000) {
    status = 409
    const field = Object.keys(err.keyPattern || {})[0] || 'value'
    message = field === 'email' ? 'An account with this email already exists' : `Duplicate value for ${field}`
  } else if (err.type === 'entity.parse.failed') {
    status = 400
    message = 'Malformed JSON in request body'
  } else if (err.type === 'entity.too.large') {
    status = 413
    message = 'Request body is too large'
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    status = 401
    message = 'Invalid or expired token.'
  } else {
    console.error(err)
    if (!env.production) details = { stack: err.message }
  }

  res.status(status).json({ success: false, error: { status, message, ...(details && { details }) } })
}

import 'dotenv/config'

const placeholder = (v) => !v || v.startsWith('your_') || v.startsWith('replace_')
const missing = ['MONGODB_URI', 'JWT_SECRET'].filter((k) => placeholder(process.env[k]))
if (missing.length) {
  console.error(`Missing or placeholder environment variables: ${missing.join(', ')}`)
  console.error('Copy .env.example to .env and fill in real values.')
  process.exit(1)
}

const list = (v) => (v || '').split(',').map((s) => s.trim()).filter(Boolean)

export const env = {
  port: Number(process.env.PORT) || 3000,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  corsOrigins: list(process.env.CORS_ORIGINS || 'http://localhost:5173'),
  // An empty value disables OAuth 2.0 token validation.
  oauthUserInfoUrl: process.env.OAUTH_USERINFO_URL ?? 'https://openidconnect.googleapis.com/v1/userinfo',
  oauthAllowedEmails: list(process.env.OAUTH_ALLOWED_EMAILS).map((e) => e.toLowerCase()),
  rateWindowMs: (Number(process.env.RATE_LIMIT_WINDOW_MINUTES) || 15) * 60 * 1000,
  rateMax: Number(process.env.RATE_LIMIT_MAX) || 100,
  loginRateMax: Number(process.env.LOGIN_RATE_LIMIT_MAX) || 5,
  production: process.env.NODE_ENV === 'production',
}

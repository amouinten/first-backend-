import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { env } from './config/env.js'
import { apiLimiter } from './middleware/rateLimiters.js'
import { errorHandler, notFound } from './middleware/errorHandler.js'
import authRoutes from './routes/authRoutes.js'
import productRoutes from './routes/productRoutes.js'

const app = express()

app.use(helmet())
// Only the listed origins (the React dev server by default) may call the API from a browser.
app.use(cors({ origin: env.corsOrigins }))
app.use(express.json({ limit: '100kb' }))

app.get('/', (_req, res) => res.json({ success: true, message: 'OUINSHOP API is running', docs: 'See README.md', endpoints: ['/api/products', '/api/auth/register', '/api/auth/login', '/api/auth/me'] }))

app.use('/api', apiLimiter) // general rate limit for every API route
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)

app.use(notFound)
app.use(errorHandler)

export default app

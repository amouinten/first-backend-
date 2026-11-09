import { Router } from 'express'
import { login, me, register } from '../controllers/authController.js'
import { authenticate } from '../middleware/auth.js'
import { loginLimiter } from '../middleware/rateLimiters.js'

const router = Router()
router.post('/register', register)
router.post('/login', loginLimiter, login)
router.get('/me', authenticate, me)
export default router

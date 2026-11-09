import { Router } from 'express'
import { createProduct, deleteProduct, getProduct, listProducts, updateProduct } from '../controllers/productController.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()
router.get('/', listProducts) // public
router.get('/:id', getProduct) // public
router.post('/', authenticate, createProduct) // JWT or OAuth 2.0 token required
router.put('/:id', authenticate, updateProduct)
router.delete('/:id', authenticate, deleteProduct)
export default router

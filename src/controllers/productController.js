import mongoose from 'mongoose'
import { Product, PRODUCT_FIELDS } from '../models/Product.js'
import { AppError, asyncHandler } from '../utils/AppError.js'

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const SORTS = { 'price-asc': { price: 1 }, 'price-desc': { price: -1 }, rating: { rating: -1, reviews: -1 }, newest: { createdAt: -1 } }

function checkId(id) {
  if (!mongoose.isValidObjectId(id)) throw new AppError(400, `Invalid product id: ${id}`)
}

// Keeps only known fields from the request body.
function pickFields(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new AppError(400, 'Request body must be a JSON object')
  return Object.fromEntries(PRODUCT_FIELDS.filter((f) => body[f] !== undefined).map((f) => [f, body[f]]))
}

// GET /api/products?category=&q=&minPrice=&maxPrice=&sort=
export const listProducts = asyncHandler(async (req, res) => {
  const { category, q, minPrice, maxPrice, sort } = req.query
  const filter = {}
  if (typeof category === 'string' && category) filter.category = category
  if (typeof q === 'string' && q.trim()) {
    const rx = new RegExp(escapeRegex(q.trim()), 'i')
    filter.$or = [{ name: rx }, { brand: rx }, { category: rx }]
  }
  for (const [key, op] of [['minPrice', '$gte'], ['maxPrice', '$lte']]) {
    if (req.query[key] === undefined || req.query[key] === '') continue
    const n = Number(req.query[key])
    if (!Number.isFinite(n) || n < 0) throw new AppError(400, `${key} must be a non-negative number`)
    filter.price = { ...filter.price, [op]: n }
  }
  const products = await Product.find(filter).sort(SORTS[sort] || { _id: 1 })
  res.status(200).json({ success: true, count: products.length, data: products })
})

// GET /api/products/:id
export const getProduct = asyncHandler(async (req, res) => {
  checkId(req.params.id)
  const product = await Product.findById(req.params.id)
  if (!product) throw new AppError(404, 'Product not found')
  res.status(200).json({ success: true, data: product })
})

// POST /api/products  (protected)
export const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(pickFields(req.body))
  res.status(201).json({ success: true, data: product })
})

// PUT /api/products/:id  (protected): send all fields or only the ones to change
export const updateProduct = asyncHandler(async (req, res) => {
  checkId(req.params.id)
  const changes = pickFields(req.body)
  if (!Object.keys(changes).length) throw new AppError(400, `Provide at least one field to update (${PRODUCT_FIELDS.join(', ')})`)
  const product = await Product.findByIdAndUpdate(req.params.id, changes, { new: true, runValidators: true })
  if (!product) throw new AppError(404, 'Product not found')
  res.status(200).json({ success: true, data: product })
})

// DELETE /api/products/:id  (protected)
export const deleteProduct = asyncHandler(async (req, res) => {
  checkId(req.params.id)
  const product = await Product.findByIdAndDelete(req.params.id)
  if (!product) throw new AppError(404, 'Product not found')
  res.status(200).json({ success: true, message: 'Product deleted', data: product })
})

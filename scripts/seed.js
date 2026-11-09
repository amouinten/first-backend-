// Fills the database with the OUINSHOP catalogue. Run with: npm run seed
import { readFile } from 'node:fs/promises'
import mongoose from 'mongoose'
import { connectDb } from '../src/config/db.js'
import { Product } from '../src/models/Product.js'

const products = JSON.parse(await readFile(new URL('../data/products.json', import.meta.url), 'utf8'))

await connectDb()
await Product.deleteMany({})
const inserted = await Product.insertMany(products)
console.log(`Seeded ${inserted.length} products.`)
await mongoose.disconnect()

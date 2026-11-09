import mongoose from 'mongoose'

export const DEPARTMENTS = ['Timepieces', 'Fragrance & Beauty', 'Leather & Footwear', 'Eyewear & Jewels', 'Tech', 'Maison']

const productSchema = new mongoose.Schema(
  {
    // Fields required by the lab
    name: { type: String, required: [true, 'name is required'], trim: true, maxlength: [150, 'name is too long'] },
    description: { type: String, required: [true, 'description is required'], trim: true, maxlength: [2000, 'description is too long'] },
    price: { type: Number, required: [true, 'price is required'], min: [0, 'price must be 0 or more'] },
    category: { type: String, required: [true, 'category is required'], enum: { values: DEPARTMENTS, message: `category must be one of: ${DEPARTMENTS.join(', ')}` } },
    imageUrl: { type: String, required: [true, 'imageUrl is required'], trim: true },
    stock: { type: Number, default: 0, min: [0, 'stock must be 0 or more'], validate: { validator: Number.isInteger, message: 'stock must be a whole number' } },
    // Extra fields used by the OUINSHOP interface
    brand: { type: String, trim: true },
    subcategory: { type: String, trim: true },
    oldPrice: { type: Number, min: [0, 'oldPrice must be 0 or more'] },
    rating: { type: Number, min: [0, 'rating must be between 0 and 5'], max: [5, 'rating must be between 0 and 5'], default: 0 },
    reviews: { type: Number, min: [0, 'reviews must be 0 or more'], default: 0 },
    images: { type: [String], default: [] },
    sku: { type: String, trim: true, unique: true, sparse: true },
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
      transform: (_doc, ret) => {
        ret.id = ret._id
        delete ret._id
        return ret
      },
    },
  },
)

productSchema.index({ category: 1, price: 1 })

export const Product = mongoose.model('Product', productSchema)

// Fields a client is allowed to set (protects against mass assignment).
export const PRODUCT_FIELDS = ['name', 'description', 'price', 'category', 'imageUrl', 'stock', 'brand', 'subcategory', 'oldPrice', 'rating', 'reviews', 'images', 'sku']

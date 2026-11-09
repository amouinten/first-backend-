import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'name is required'], trim: true, minlength: [2, 'name must have at least 2 characters'], maxlength: [80, 'name is too long'] },
    email: { type: String, required: [true, 'email is required'], unique: true, lowercase: true, trim: true, match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'email is not valid'] },
    // Only the bcrypt hash is stored; it is never returned by queries or in JSON.
    passwordHash: { type: String, required: true, select: false },
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
      transform: (_doc, ret) => {
        ret.id = ret._id
        delete ret._id
        delete ret.passwordHash
        return ret
      },
    },
  },
)

export const User = mongoose.model('User', userSchema)

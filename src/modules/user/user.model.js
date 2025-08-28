import mongoose from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

const userSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: uuidv4
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    first_name: {
      type: String,
      default: null
    },
    last_name: {
      type: String,
      default: null
    },
    new_email: {
      type: String,
      default: null
    },
    phone_number: {
      type: String,
      default: null
    },
    old_passwords: {
      type: [String],
      required: true,
      default: []
    },
    password: {
      type: String,
      default: null
    },
    status: {
      type: String,
      required: true,
      enum: ['active', 'inactive', 'invited', 'unverified'],
      default: 'unverified'
    },
    roles: [{ type: String, ref: 'Role' }]
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
)

userSchema.index({ created_at: 1 })
userSchema.index({ email: 1 }, { unique: true })
userSchema.index({ first_name: 1, last_name: 1 })
userSchema.index({ status: 1 })
userSchema.index({ updated_at: 1 })

export const User = mongoose.model('User', userSchema)

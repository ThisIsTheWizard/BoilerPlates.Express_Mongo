import mongoose from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

const userSchema = new mongoose.Schema(
  {
    _id: {
      default: uuidv4,
      type: String
    },
    email: {
      required: true,
      type: String
    },
    first_name: {
      default: null,
      type: String
    },
    last_name: {
      default: null,
      type: String
    },
    new_email: {
      default: null,
      type: String
    },
    old_passwords: {
      default: [],
      required: true,
      type: [String]
    },
    password: {
      default: null,
      type: String
    },
    phone_number: {
      default: null,
      type: String
    },
    roles: [{ ref: 'Role', type: String }],
    status: {
      default: 'unverified',
      enum: ['active', 'inactive', 'invited', 'unverified'],
      required: true,
      type: String
    }
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

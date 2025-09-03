import mongoose from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

const authTokenSchema = new mongoose.Schema(
  {
    _id: {
      default: uuidv4,
      type: String
    },
    access_token: {
      required: true,
      type: String
    },
    expires_at: {
      default: null,
      type: Date
    },
    refresh_token: {
      default: null,
      type: String
    },
    user_id: {
      ref: 'users',
      required: true,
      type: String
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
)

authTokenSchema.index({ access_token: 1, user_id: 1 }, { unique: true })
authTokenSchema.index({ created_at: 1 })
authTokenSchema.index({ refresh_token: 1 })
authTokenSchema.index({ updated_at: 1 })

export const AuthToken = mongoose.model('auth_tokens', authTokenSchema)

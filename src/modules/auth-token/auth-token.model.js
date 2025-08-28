import mongoose from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

const authTokenSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: uuidv4
    },
    access_token: {
      type: String,
      required: true
    },
    expires_at: {
      type: Date,
      default: null
    },
    refresh_token: {
      type: String,
      default: null
    },
    user_id: {
      type: String,
      ref: 'User',
      required: true
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

export const AuthToken = mongoose.model('AuthToken', authTokenSchema)

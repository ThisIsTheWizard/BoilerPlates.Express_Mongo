import mongoose from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

const roleUserSchema = new mongoose.Schema(
  {
    _id: {
      default: uuidv4,
      type: String
    },
    role_id: {
      ref: 'roles',
      required: true,
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

roleUserSchema.index({ created_at: 1 })
roleUserSchema.index({ role_id: 1, user_id: 1 }, { unique: true })
roleUserSchema.index({ updated_at: 1 })

export const RoleUser = mongoose.model('role_users', roleUserSchema)

import mongoose from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

const roleUserSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: uuidv4
    },
    role_id: {
      type: String,
      ref: 'Role',
      required: true
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

roleUserSchema.index({ created_at: 1 })
roleUserSchema.index({ role_id: 1 })
roleUserSchema.index({ user_id: 1 })
roleUserSchema.index({ updated_at: 1 })

export const RoleUser = mongoose.model('RoleUser', roleUserSchema)

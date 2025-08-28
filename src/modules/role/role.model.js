import mongoose from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

const roleSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: uuidv4
    },
    name: {
      type: String,
      required: true,
      enum: ['admin', 'developer', 'moderator', 'user']
    },
    created_by: {
      type: String,
      default: null
    },
    permissions: [{ type: String, ref: 'Permission' }]
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
)

roleSchema.index({ created_at: 1 })
roleSchema.index({ created_by: 1 })
roleSchema.index({ name: 1 }, { unique: true })
roleSchema.index({ updated_at: 1 })

export const Role = mongoose.model('Role', roleSchema)

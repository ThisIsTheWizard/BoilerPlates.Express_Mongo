import mongoose from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

const roleSchema = new mongoose.Schema(
  {
    _id: {
      default: uuidv4,
      type: String
    },
    created_by: {
      default: null,
      type: String
    },
    name: {
      enum: ['admin', 'developer', 'moderator', 'user'],
      required: true,
      type: String
    },
    permissions: [
      {
        can_do_the_action: {
          default: false,
          type: Boolean
        },
        created_by: {
          default: null,
          type: String
        },
        permission: {
          ref: 'permissions',
          type: String
        },
        updated_by: {
          default: null,
          type: String
        }
      }
    ]
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
)

roleSchema.index({ created_at: 1 })
roleSchema.index({ created_by: 1 })
roleSchema.index({ name: 1 }, { unique: true })
roleSchema.index({ updated_at: 1 })

export const Role = mongoose.model('roles', roleSchema)

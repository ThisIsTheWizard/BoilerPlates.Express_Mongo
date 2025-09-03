import mongoose from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

const permissionSchema = new mongoose.Schema(
  {
    _id: {
      default: uuidv4,
      type: String
    },
    action: {
      enum: ['create', 'read', 'update', 'delete'],
      required: true,
      type: String
    },
    created_by: {
      default: null,
      type: String
    },
    module: {
      enum: ['permission', 'role', 'role_permission', 'role_user', 'user'],
      required: true,
      type: String
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
)

permissionSchema.index({ action: 1, module: 1 }, { unique: true })
permissionSchema.index({ created_at: 1 })
permissionSchema.index({ created_by: 1 })
permissionSchema.index({ updated_at: 1 })

export const Permission = mongoose.model('permissions', permissionSchema)

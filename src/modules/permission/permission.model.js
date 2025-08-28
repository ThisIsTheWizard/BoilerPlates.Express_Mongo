import mongoose from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

const permissionSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: uuidv4
    },
    action: {
      type: String,
      required: true,
      enum: ['create', 'read', 'update', 'delete']
    },
    module: {
      type: String,
      required: true,
      enum: ['permission', 'role', 'role_permission', 'role_user', 'user']
    },
    created_by: {
      type: String,
      default: null
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
)

permissionSchema.index({ id: 1 }, { unique: true })
permissionSchema.index({ created_at: 1 })
permissionSchema.index({ created_by: 1 })
permissionSchema.index({ action: 1 }, { unique: true })
permissionSchema.index({ module: 1 })
permissionSchema.index({ updated_at: 1 })

export const Permission = mongoose.model('Permission', permissionSchema)

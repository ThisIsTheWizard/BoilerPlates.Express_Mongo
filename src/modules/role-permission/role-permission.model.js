import mongoose from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

const rolePermissionSchema = new mongoose.Schema(
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
    permission_id: {
      type: String,
      ref: 'Permission',
      required: true
    },
    can_do_the_action: {
      type: Boolean,
      required: true,
      default: false
    },
    created_by: {
      type: String,
      default: null
    },
    updated_by: {
      type: String,
      default: null
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
)

rolePermissionSchema.index({ created_at: 1 })
rolePermissionSchema.index({ created_by: 1 })
rolePermissionSchema.index({ permission_id: 1, role_id: 1 }, { unique: true })
rolePermissionSchema.index({ updated_at: 1 })
rolePermissionSchema.index({ updated_by: 1 })

export const RolePermission = mongoose.model('RolePermission', rolePermissionSchema)

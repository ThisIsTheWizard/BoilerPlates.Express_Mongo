import mongoose from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

const rolePermissionSchema = new mongoose.Schema(
  {
    _id: {
      default: uuidv4,
      type: String
    },
    can_do_the_action: {
      default: false,
      required: true,
      type: Boolean
    },
    created_by: {
      default: null,
      type: String
    },
    permission_id: {
      ref: 'permissions',
      required: true,
      type: String
    },
    role_id: {
      ref: 'roles',
      required: true,
      type: String
    },
    updated_by: {
      default: null,
      type: String
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

export const RolePermission = mongoose.model('role_permissions', rolePermissionSchema)

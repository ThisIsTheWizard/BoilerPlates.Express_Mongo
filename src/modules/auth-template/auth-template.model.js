import mongoose from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

const authTemplateSchema = new mongoose.Schema(
  {
    _id: {
      default: uuidv4,
      type: String
    },
    body: {
      required: true,
      type: String
    },
    created_by: {
      default: null,
      type: String
    },
    event: {
      required: true,
      type: String
    },
    subject: {
      required: true,
      type: String
    }
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
)

authTemplateSchema.index({ created_at: 1 })
authTemplateSchema.index({ created_by: 1 })
authTemplateSchema.index({ event: 1 }, { unique: true })
authTemplateSchema.index({ subject: 1 })
authTemplateSchema.index({ updated_at: 1 })

export const AuthTemplate = mongoose.model('auth_templates', authTemplateSchema)

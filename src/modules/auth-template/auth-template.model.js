import mongoose from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

const authTemplateSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: uuidv4
    },
    body: {
      type: String,
      required: true
    },
    created_by: {
      type: String,
      default: null
    },
    event: {
      type: String,
      required: true
    },
    subject: {
      type: String,
      required: true
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
)

authTemplateSchema.index({ created_at: 1 })
authTemplateSchema.index({ created_by: 1 })
authTemplateSchema.index({ event: 1 }, { unique: true })
authTemplateSchema.index({ subject: 1 })
authTemplateSchema.index({ updated_at: 1 })

export const AuthTemplate = mongoose.model('AuthTemplate', authTemplateSchema)

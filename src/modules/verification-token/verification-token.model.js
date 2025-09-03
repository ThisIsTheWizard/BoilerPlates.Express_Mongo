import moment from 'moment-timezone'
import mongoose from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

const verificationTokenSchema = new mongoose.Schema(
  {
    _id: {
      default: uuidv4,
      type: String
    },
    email: {
      required: true,
      type: String
    },
    expired_at: {
      default: () => moment().add(5, 'minutes').toDate(),
      required: true,
      type: Date
    },
    status: {
      default: 'unverified',
      enum: ['cancelled', 'verified', 'unverified'],
      required: true,
      type: String
    },
    token: {
      required: true,
      type: String
    },
    type: {
      default: 'user_verification',
      enum: ['forgot_password', 'user_verification'],
      required: true,
      type: String
    },
    user_id: {
      ref: 'User',
      required: true,
      type: String
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
)

verificationTokenSchema.index({ email: 1, token: 1, user_id: 1 })
verificationTokenSchema.index({ created_at: 1 })
verificationTokenSchema.index({ updated_at: 1 })

export const VerificationToken = mongoose.model('VerificationToken', verificationTokenSchema)

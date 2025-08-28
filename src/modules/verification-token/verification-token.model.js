import moment from 'moment-timezone'
import mongoose from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

const verificationTokenSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: uuidv4
    },
    email: {
      type: String,
      required: true
    },
    expired_at: {
      type: Date,
      required: true,
      default: () => moment().add(5, 'minutes').toDate()
    },
    status: {
      type: String,
      required: true,
      enum: ['cancelled', 'verified', 'unverified'],
      default: 'unverified'
    },
    token: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true,
      enum: ['forgot_password', 'user_verification'],
      default: 'user_verification'
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

verificationTokenSchema.index({ email: 1, token: 1, user_id: 1 })
verificationTokenSchema.index({ created_at: 1 })
verificationTokenSchema.index({ updated_at: 1 })

export const VerificationToken = mongoose.model('VerificationToken', verificationTokenSchema)

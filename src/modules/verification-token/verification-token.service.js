import { omit } from 'lodash'
import moment from 'moment-timezone'

// Models
import { VerificationToken } from 'src/modules/models'

// Helpers
import { commonHelper, userHelper, verificationTokenHelper } from 'src/modules/helpers'

// Services
import { notificationService } from 'src/modules/services'

// Utils
import { CustomError } from 'src/utils/error'

export const createAVerificationToken = async (data, session) => {
  const [verificationToken] = await VerificationToken.create([data], { session })
  return verificationToken
}

export const updateAVerificationToken = async (options, data, session) => {
  const { query, skip, sort } = options || {}

  const verificationToken = await VerificationToken.findOneAndUpdate(query, data, { new: true, skip, sort }).session(
    session
  )
  if (!verificationToken?._id) {
    throw new CustomError(404, 'VERIFICATION_TOKEN_NOT_FOUND')
  }

  return verificationToken
}

export const updateVerificationTokens = async (options, data, session) => {
  const { query, skip, sort } = options || {}

  return VerificationToken.updateMany(query, data, { skip, sort }).session(session)
}

export const deleteAVerificationToken = async (options, session) => {
  const { query, skip, sort } = options || {}

  const verificationToken = await VerificationToken.findOneAndDelete(query, { skip, sort }).session(session)
  if (!verificationToken?._id) {
    throw new CustomError(404, 'VERIFICATION_TOKEN_NOT_FOUND')
  }

  return verificationToken
}

export const deleteVerificationTokens = async (options, session) => {
  const { query, skip, sort } = options || {}

  return VerificationToken.deleteMany(query, { skip, sort }).session(session)
}

export const createAVerificationTokenForUser = async (params, session) => {
  commonHelper.validateProps(
    [
      { field: 'email', required: true, type: 'string' },
      { field: 'first_name', required: false, type: 'string' },
      { field: 'last_name', required: false, type: 'string' },
      { field: 'type', required: true, type: 'string' },
      { field: 'user_id', required: true, type: 'string' }
    ],
    params
  )

  const { email, first_name, last_name, type, user_id } = params || {}
  if (!['forgot_password', 'user_verification'].includes(type)) {
    throw new Error('TYPE_IS_INVALID')
  }

  const verificationToken = await createAVerificationToken(
    { email, token: commonHelper.getRandomNumber(6), type, user_id },
    session
  )
  if (!verificationToken?.id) {
    throw new Error('COULD_NOT_CREATE_VERIFICATION_TOKEN')
  }

  await notificationService.sendNotification({
    event: type === 'forgot_password' ? 'send_forgot_password_token' : 'send_user_verification_token',
    to_email: email,
    variables: {
      email,
      token: verificationToken?.token,
      url: process.env.WEB_URL || '',
      username: userHelper.getUsernameByNames(email, first_name, last_name)
    }
  })

  return verificationToken
}

export const validateVerificationTokenForUser = async (params = {}, session) => {
  commonHelper.validateRequiredProps(['token', 'type'], params)

  const { email, token, type, user_id } = params || {}
  if (!(email || user_id)) {
    throw new Error('MISSING_EMAIL_OR_USER_ID')
  }
  if (!['forgot_password', 'user_verification'].includes(type)) {
    throw new Error('TYPE_IS_INVALID')
  }

  const query = { status: 'unverified', token, type }

  if (email) query.email = email
  if (user_id) query.user_id = user_id

  const verificationToken = await verificationTokenHelper.getAVerificationToken({ query }, session)
  if (!verificationToken?.id) {
    throw new Error('OTP_IS_NOT_VALID')
  }
  if (moment(verificationToken?.expired_at).isBefore(moment())) {
    throw new Error('OTP_IS_EXPIRED')
  }

  await deleteVerificationTokens({ query: omit(query, ['token']) }, session)

  return verificationToken
}

import { omit } from 'lodash'
import moment from 'moment-timezone'

// Models
import { VerificationToken } from 'src/modules/models'

// Helpers
import { verificationTokenHelper } from 'src/modules/helpers'

// Services

// Utils
import { CustomError } from 'src/utils/error'

import { head } from 'lodash'

// Models

// Helpers
import { commonHelper } from 'src/modules/helpers'

// Services
import {} from 'src/modules/services'

export const createAVerificationToken = async (data, options, session) => {
  const verificationTokens = await VerificationToken.create([data], { session })

  return head(verificationTokens)
}

export const updateAVerificationToken = async (options, data, session) => {
  const verificationToken = await verificationTokenHelper.getAVerificationToken(options, session)
  if (!verificationToken?._id) throw new CustomError(404, 'VERIFICATION_TOKEN_NOT_FOUND')

  verificationToken.set(data)
  await verificationToken.save({ session })

  return verificationToken
}

export const updateVerificationTokens = async (options, data, session) =>
  VerificationToken.updateMany(options.where, data, { session })

export const deleteAVerificationToken = async (options, session) => {
  const verificationToken = await verificationTokenHelper.getAVerificationToken(options, session)
  if (!verificationToken?._id) throw new CustomError(404, 'VERIFICATION_TOKEN_NOT_FOUND')

  await verificationToken.deleteOne({ session })

  return verificationToken
}

export const deleteVerificationTokens = async (options, session) =>
  VerificationToken.deleteMany(options.where).session(session)

export const createAVerificationTokenForUser = async (params, session) => {
  const { email, first_name, last_name, type, user_id } = params || {}

  const token = commonHelper.getRandomNumber(6)
  const expired_at = moment().add(10, 'minutes').toDate()

  const verificationToken = await createAVerificationToken(
    { email, expired_at, first_name, last_name, token, type, user_id },
    null,
    session
  )
  if (!verificationToken?._id) {
    throw new CustomError(500, 'COULD_NOT_CREATE_VERIFICATION_TOKEN')
  }

  return verificationToken
}

export const validateVerificationTokenForUser = async (params = {}, session) => {
  const { email, token, type, user_id } = params || {}
  const where = omit({ email, token, type, user_id }, ['token'])
  const verificationToken = await verificationTokenHelper.getAVerificationToken({ where }, session)
  if (!verificationToken?._id) throw new CustomError(404, 'VERIFICATION_TOKEN_NOT_FOUND')
  if (verificationToken?.token !== token) throw new CustomError(401, 'VERIFICATION_TOKEN_IS_INVALID')
  if (moment(verificationToken?.expired_at).isBefore(moment()))
    throw new CustomError(401, 'VERIFICATION_TOKEN_IS_EXPIRED')

  await deleteVerificationTokens({ where: omit(where, ['token']) }, session)

  return verificationToken
}

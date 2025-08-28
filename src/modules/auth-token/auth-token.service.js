// Models
import { head } from 'lodash'

// Models
import { AuthToken } from 'src/modules/models'

// Helpers
import { authTokenHelper, userHelper } from 'src/modules/helpers'

// Service
import { commonService } from 'src/modules/services'

// Utils
import { CustomError } from 'src/utils/error'

export const createAnAuthToken = async (data, options, session) => {
  const authTokens = await AuthToken.create([data], { session })

  return head(authTokens)
}

export const updateAnAuthToken = async (options, data, session) => {
  const authToken = await authTokenHelper.getAnAuthToken(options, session)
  if (!authToken?._id) throw new CustomError(404, 'AUTH_TOKEN_NOT_FOUND')

  authToken.set(data)
  await authToken.save({ session })

  return authToken
}

export const deleteAnAuthToken = async (options, session) => {
  const authToken = await authTokenHelper.getAnAuthToken(options, session)
  if (!authToken?._id) throw new CustomError(404, 'AUTH_TOKEN_NOT_FOUND')

  await authToken.deleteOne({ session })

  return authToken
}

export const deleteAuthTokens = async (options, session) => AuthToken.deleteMany(options.where).session(session)

export const createAuthTokensForUser = async (params, session) => {
  const { roles, user_id } = params || {}
  const access_token = commonService.generateJWTToken({ roles, user_id })
  const refresh_token = commonService.generateJWTToken({ roles, user_id })

  const authToken = await createAnAuthToken({ access_token, refresh_token, user_id }, null, session)
  if (!authToken?._id) throw new CustomError(500, 'COULD_NOT_CREATE_AUTH_TOKEN')

  return { access_token, refresh_token }
}

export const verifyAnAuthTokenForUser = async (params, session) => {
  const { access_token } = params || {}
  const authToken = await authTokenHelper.getAnAuthToken({ access_token }, session)
  if (!authToken?._id) throw new CustomError(404, 'AUTH_TOKEN_NOT_FOUND')

  return authToken
}

export const refreshAuthTokensForUser = async (params = {}, session) => {
  const { refresh_token, roles, user_id } = params || {}
  const authToken = await authTokenHelper.getAnAuthToken({ refresh_token }, session)
  if (!authToken?._id) throw new CustomError(404, 'AUTH_TOKEN_NOT_FOUND')

  await authToken.deleteOne({ session })

  return createAuthTokensForUser({ roles, user_id }, session)
}

export const revokeAnAuthTokenForUser = async (params = {}, session) => {
  const { access_token, refresh_token } = params || {}
  const type = access_token ? 'access_token' : 'refresh_token'
  const token = access_token || refresh_token

  const authToken = await deleteAnAuthToken({ [type]: token }, session)
  if (!authToken?._id) throw new CustomError(404, 'AUTH_TOKEN_NOT_FOUND')

  return authToken
}

export const revokeAuthTokensForUser = async (params = {}, session) => {
  const { user_id } = params || {}
  const user = await userHelper.getAUser({ where: { _id: user_id } }, session)
  if (!user?._id) throw new CustomError(404, 'USER_NOT_FOUND')

  const deletedCount = await deleteAuthTokens({ user_id }, session)

  return { deleted_count: deletedCount }
}

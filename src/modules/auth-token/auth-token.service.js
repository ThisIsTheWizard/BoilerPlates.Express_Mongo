// Model
import { AuthToken } from 'src/modules/models'

// Helpers
import { authTokenHelper, commonHelper, userHelper } from 'src/modules/helpers'

// Services
import { commonService } from 'src/modules/services'

// Utils
import { CustomError } from 'src/utils/error'

export const createAnAuthToken = async (data, session) => {
  const [authToken] = await AuthToken.create([data], { session })
  return authToken
}

export const updateAnAuthToken = async (options, data, session) => {
  const { query, sort } = options || {}

  const authToken = await AuthToken.findOneAndUpdate(query, data, { new: true, sort }).session(session)
  if (!authToken?._id) {
    throw new CustomError(404, 'AUTH_TOKEN_NOT_FOUND')
  }

  return authToken
}

export const deleteAnAuthToken = async (options, session) => {
  const { query, skip, sort } = options || {}

  const authToken = await AuthToken.findOneAndDelete(query, { skip, sort }).session(session)
  if (!authToken?._id) {
    throw new CustomError(404, 'AUTH_TOKEN_NOT_FOUND')
  }

  return authToken
}

export const deleteAuthTokens = async (options, session) => {
  const { query, skip, sort } = options || {}

  return AuthToken.deleteMany(query, { skip, sort }).session(session)
}

export const createAuthTokensForUser = async (params, session) => {
  commonHelper.validateRequiredProps(['roles', 'user_id'], params)

  const { roles, user_id } = params || {}

  const accessTokenExpiry = process.env.ACCESS_TOKEN_EXPIRY || '1d'
  const refreshTokenExpiry = process.env.REFRESH_TOKEN_EXPIRY || '30d'

  const access_token = commonService.generateJWTToken({ roles, sub: user_id, user_id }, accessTokenExpiry)
  const refresh_token = commonService.generateJWTToken({ sub: user_id, user_id }, refreshTokenExpiry)

  const authToken = await createAnAuthToken({ access_token, refresh_token, user_id }, session)
  if (!authToken?.id) {
    throw new Error('COULD_NOT_CREATE_AUTH_TOKEN')
  }

  return { access_token, refresh_token }
}

export const verifyAnAuthTokenForUser = async (params = {}) => {
  commonHelper.validateProps(
    [
      { field: 'token', required: true, type: 'string' },
      { field: 'type', required: true, type: 'string' }
    ],
    params
  )

  const { token, type } = params || {}
  if (!['access_token', 'refresh_token'].includes(type)) {
    throw new Error('TOKEN_TYPE_IS_INVALID')
  }

  const { user_id } = commonService.decodeJWTToken(token) || {}
  const authToken = await authTokenHelper.getAnAuthToken({
    query: { [type]: token, user_id }
  })
  if (!authToken?.id) {
    return { message: 'INVALID_TOKEN', success: false }
  }

  return commonService.verifyJWTToken(token) || {}
}

export const refreshAuthTokensForUser = async (params = {}, session) => {
  commonHelper.validateProps(
    [
      { field: 'refresh_token', required: true, type: 'string' },
      { field: 'roles', required: true, type: 'object' },
      { field: 'user_id', required: true, type: 'string' }
    ],
    params
  )

  const { refresh_token, roles, user_id } = params || {}

  commonService.verifyJWTToken(refresh_token)

  await deleteAnAuthToken({ query: { refresh_token, user_id } }, session)

  const user = await userHelper.getAUser({ query: { _id: user_id } }, session)
  if (!user?._id) {
    throw new Error('USER_NOT_FOUND')
  }
  if (!(user?.status === 'active')) {
    throw new Error('USER_IS_NOT_ACTIVE')
  }

  return createAuthTokensForUser({ roles, user_id }, session)
}

export const revokeAnAuthTokenForUser = async (params = {}, session) => {
  commonHelper.validateProps(
    [
      { field: 'token', required: true, type: 'string' },
      { field: 'type', required: true, type: 'string' }
    ],
    params
  )

  const { token, type } = params || {}
  if (!['access_token', 'refresh_token'].includes(type)) {
    throw new Error('TOKEN_TYPE_IS_INVALID')
  }

  const authToken = await deleteAnAuthToken({ query: { [type]: token } }, session)
  if (!authToken?.id) {
    return { message: 'INVALID_TOKEN', success: false }
  }

  return { message: 'LOGGED_OUT', success: true }
}

export const revokeAuthTokensForUser = async (params = {}, session) => {
  commonHelper.validateProps([{ field: 'user_id', required: true, type: 'string' }], params)

  const { user_id } = params || {}
  const user = await userHelper.getAUser({ query: { _id: user_id } }, session)
  if (!user?._id) {
    throw new Error('USER_IS_NOT_FOUND')
  }
  if (!(user?.status === 'active')) {
    throw new Error('USER_IS_NOT_ACTIVE')
  }

  const deletedCount = await deleteAuthTokens({ query: { user_id } }, session)
  if (deletedCount <= 0) {
    return { message: 'INVALID_TOKEN', success: false }
  }

  return { message: 'LOGGED_OUT', success: true }
}

import { AuthToken } from 'src/modules/models'

// Helpers
import {} from 'src/modules/helpers'

// Services
import {} from 'src/modules/services'

// Utils
import { CustomError } from 'src/utils/error'

export const getAnAuthToken = async (options, session) => AuthToken.findOne(options).session(session)

export const getAuthTokens = async (options, session) => AuthToken.find(options).session(session)

export const countAuthTokens = async (options) => AuthToken.countDocuments(options)

export const prepareAuthTokenQuery = (params = {}) => {
  const query = {}

  if (params?.access_token) query.access_token = params.access_token
  if (params?.entity_id) query._id = params.entity_id
  if (params?.refresh_token) query.refresh_token = params.refresh_token
  if (params?.user_id) query.user_id = params.user_id

  return query
}

export const getAnAuthTokenForQuery = async (params) => {
  const query = prepareAuthTokenQuery(params)
  const authToken = await getAnAuthToken({ where: query })
  if (!authToken?._id) throw new CustomError(404, 'AUTH_TOKEN_NOT_FOUND')

  return authToken
}

export const getAuthTokensForQuery = async (params) => {
  const { options = {}, query = {} } = params || {}
  const { limit, skip, sort } = options || {}

  const where = prepareAuthTokenQuery(query)
  const authTokens = await getAuthTokens({
    limit,
    skip,
    sort,
    where
  })
  const filtered_rows = await countAuthTokens({ where })
  const total_rows = await countAuthTokens({ where: {} })

  return { data: authTokens, meta_data: { filtered_rows, total_rows } }
}

import { AuthToken } from 'src/modules/models'

// Helpers
import {} from 'src/modules/helpers'

// Services
import {} from 'src/modules/services'

// Utils
import { CustomError } from 'src/utils/error'

export const countAuthTokens = async (options) => AuthToken.countDocuments(options)

export const getAnAuthToken = async (options, session) => AuthToken.findOne(options).session(session)

export const getAuthTokens = async (options, session) => AuthToken.find(options).session(session)

export const prepareAuthTokenQuery = (params = {}) => {
  const query = {}

  if (params?.access_token) query.access_token = params.access_token
  if (size(params?.exclude_entity_ids) || size(params?.include_entity_ids)) {
    query._id = {
      $and: [
        ...(size(params?.exclude_entity_ids) ? [{ $nin: params?.exclude_entity_ids }] : []),
        ...(size(params?.include_entity_ids) ? [{ $in: params?.include_entity_ids }] : [])
      ]
    }
  }
  if (params?.refresh_token) query.refresh_token = params.refresh_token
  if (params?.user_id) query.user_id = params.user_id

  return query
}

export const getAnAuthTokenForQuery = async (params) => {
  const query = prepareAuthTokenQuery(params)
  const authToken = await getAnAuthToken({ query })
  if (!authToken?._id) {
    throw new CustomError(404, 'AUTH_TOKEN_NOT_FOUND')
  }

  return authToken
}

export const getAuthTokensForQuery = async (params) => {
  const { options = {} } = params || {}
  const { limit, skip, sort } = options || {}

  const query = prepareAuthTokenQuery(params?.query)
  const authTokens = await getAuthTokens({
    limit,
    skip,
    sort,
    query
  })
  const filtered_rows = await countAuthTokens(query)
  const total_rows = await countAuthTokens({})

  return { data: authTokens, meta_data: { filtered_rows, total_rows } }
}

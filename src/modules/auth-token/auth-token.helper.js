import { size } from 'lodash'

// Models
import { AuthToken } from 'src/modules/models'

// Utils
import { CustomError } from 'src/utils/error'

export const countAuthTokens = async (options) => AuthToken.countDocuments(options)

export const getAnAuthToken = async (options, session) => {
  const { populate, query, select, skip, sort } = options || {}

  return AuthToken.findOne(query, select, { populate, skip, sort }).session(session)
}

export const getAuthTokens = async (options, session) => {
  const { populate, query, select, skip, sort } = options || {}

  return AuthToken.findOne(query, select, { populate, skip, sort }).session(session)
}

export const prepareAuthTokenQuery = (params = {}) => {
  const query = {}

  if (params?.access_token) query.access_token = params.access_token
  if (size(params?.exclude_collection_ids) || size(params?.include_collection_ids)) {
    query._id = {
      $and: [
        ...(size(params?.exclude_collection_ids) ? [{ $nin: params?.exclude_collection_ids }] : []),
        ...(size(params?.include_collection_ids) ? [{ $in: params?.include_collection_ids }] : [])
      ]
    }
  }
  if (params?.refresh_token) query.refresh_token = params.refresh_token
  if (params?.user_id) query.user_id = params.user_id

  return query
}

export const getAnAuthTokenForQuery = async (params) => {
  const authToken = await getAnAuthToken({ query: { _id: params?.collection_id } })
  if (!authToken?._id) {
    throw new CustomError(404, 'AUTH_TOKEN_NOT_FOUND')
  }

  return authToken
}

export const getAuthTokensForQuery = async (params) => {
  const { limit, skip, sort } = params?.options || {}

  const query = prepareAuthTokenQuery(params?.query || {})
  const data = await getAuthTokens({
    limit,
    skip,
    sort,
    query
  })
  const filtered_rows = await countAuthTokens(query)
  const total_rows = await countAuthTokens({})

  return { data, meta_data: { filtered_rows, total_rows } }
}

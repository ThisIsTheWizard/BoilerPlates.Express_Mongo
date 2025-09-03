import { size } from 'lodash'

// Models
import { VerificationToken } from 'src/modules/models'

// Utils
import { CustomError } from 'src/utils/error'

export const countVerificationTokens = async (options) => VerificationToken.countDocuments(options)

export const getAVerificationToken = async (options, session) => {
  const { populate, query, select, skip, sort } = options || {}

  return VerificationToken.findOne(query, select, { populate, skip, sort }).session(session)
}

export const getVerificationTokens = async (options, session) => {
  const { populate, query, select, skip, sort } = options || {}

  return VerificationToken.find(query, select, { populate, skip, sort }).session(session)
}

export const prepareVerificationTokenQuery = (params = {}) => {
  const query = {}

  if (params?.collection_id) query._id = params.collection_id
  if (size(params?.exclude_collection_ids) || size(params?.include_collection_ids)) {
    query._id = {
      $and: [
        ...(size(params?.exclude_collection_ids) ? [{ $nin: params?.exclude_collection_ids }] : []),
        ...(size(params?.include_collection_ids) ? [{ $in: params?.include_collection_ids }] : [])
      ]
    }
  }
  if (params?.email) query.email = params.email
  if (params?.status) query.status = params.status
  if (params?.token) query.token = params.token
  if (params?.type) query.type = params.type
  if (params?.user_id) query.user_id = params.user_id

  return query
}

export const getAVerificationTokenForQuery = async (params) => {
  const verificationToken = await getAVerificationToken({ query: { _id: params?.collection_id } })
  if (!verificationToken?._id) {
    throw new CustomError(404, 'VERIFICATION_TOKEN_NOT_FOUND')
  }

  return verificationToken
}

export const getVerificationTokensForQuery = async (params) => {
  const { limit, skip, sort } = params?.options || {}

  const query = prepareVerificationTokenQuery(params?.query || {})
  const data = await getVerificationTokens({
    query,
    limit,
    skip,
    sort
  })
  const filtered_rows = await countVerificationTokens(query)
  const total_rows = await countVerificationTokens({})

  return { data, meta_data: { filtered_rows, total_rows } }
}

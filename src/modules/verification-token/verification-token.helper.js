import { VerificationToken } from 'src/modules/models'

// Helpers
import { commonHelper } from 'src/modules/helpers'

// Services
import {} from 'src/modules/services'

// Utils
import { CustomError } from 'src/utils/error'

export const countVerificationTokens = async (options, session) =>
  VerificationToken.countDocuments(options?.where).session(session)

export const getAVerificationToken = async (options, session) =>
  VerificationToken.findOne(options.where).session(session)

export const getVerificationTokens = async (options, session) => VerificationToken.find(options.where).session(session)

export const prepareVerificationTokenQuery = (params = {}) => {
  const query = {}

  if (params?.email) query.email = params.email
  if (params?.entity_id) query._id = params.entity_id
  if (params?.status) query.status = params.status
  if (params?.token) query.token = params.token
  if (params?.type) query.type = params.type
  if (params?.user_id) query.user_id = params.user_id

  return query
}

export const getAVerificationTokenForQuery = async (params) => {
  commonHelper.validateRequiredProps(['entity_id'], params)

  const verificationToken = await getAVerificationToken({ where: { _id: params.entity_id } })
  if (!verificationToken?._id) {
    throw new CustomError(404, 'VERIFICATION_TOKEN_DOES_NOT_EXIST')
  }

  return verificationToken
}

export const getVerificationTokensForQuery = async (params, options) => {
  const { limit, skip, sort } = options || {}

  const where = prepareVerificationTokenQuery(params)
  const verificationTokens = await getVerificationTokens({
    where,
    limit,
    skip,
    sort
  })
  const filtered_rows = await countVerificationTokens({ where })
  const total_rows = await countVerificationTokens({})

  return { data: JSON.parse(JSON.stringify(verificationTokens)), meta_data: { filtered_rows, total_rows } }
}

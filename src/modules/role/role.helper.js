import { head, intersection, size } from 'lodash'

// Models
import { Role } from 'src/modules/models'

// Helpers
import { commonHelper } from 'src/modules/helpers'

// Utils
import { CustomError } from 'src/utils/error'

export const countRoles = async (options, session) => Role.countDocuments(options?.where).session(session)

export const getARole = async (options, session) => Role.findOne(options?.where).session(session)

export const getRoles = async (options, transaction) => Role.find(options?.where).session(transaction)

export const prepareRoleQuery = (params = {}) => {
  const query = {}

  if (size(params?.exclude_entity_ids) || size(params?.include_entity_ids)) {
    query._id = {
      $and: [
        ...(size(params?.exclude_entity_ids) ? [{ $nin: params?.exclude_entity_ids }] : []),
        ...(size(params?.include_entity_ids) ? [{ $in: params?.include_entity_ids }] : [])
      ]
    }
  }
  if (size(params?.names)) {
    query.name = { $in: params.names }
  }

  return query
}

export const getARoleForQuery = async (params) => {
  commonHelper.validateProps([{ field: 'entity_id', required: true, type: 'string' }], params)

  // TODO: Implement this with populate
  const role = await getARole({ where: { _id: params?.entity_id } })
  if (!role?._id) {
    throw new CustomError(404, 'ROLE_DOES_NOT_EXIST')
  }

  return JSON.parse(JSON.stringify(role))
}

export const getRolesForQuery = async (query, options) => {
  const { limit, skip, sort } = options || {}

  const where = prepareRoleQuery(query)
  const data = await getRoles({
    where,
    limit,
    skip,
    sort
  })
  const filtered_rows = await countRoles({ where })
  const total_rows = await countRoles({ where: {} })

  return { data, meta_data: { filtered_rows, total_rows } }
}

export const getTopRoleOfAUser = (roles = []) => head(intersection(['admin', 'developer', 'moderator', 'user'], roles))

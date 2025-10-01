import { head, intersection, size } from 'lodash'

// Models
import { Role } from 'src/modules/models'

// Utils
import { CustomError } from 'src/utils/error'

export const countRoles = async (query) => Role.countDocuments(query)

export const getARole = async (options, session) => {
  const { populate, query, select, skip, sort } = options || {}

  return Role.findOne(query, select, { populate, skip, sort }).session(session)
}

export const getRoles = async (options, session) => {
  const { limit, populate, query, select, skip, sort } = options || {}

  return Role.find(query, select, { limit, populate, skip, sort }).session(session)
}

export const prepareRoleQuery = (params = {}) => {
  const query = {}

  if (size(params?.exclude_collection_ids) || size(params?.include_collection_ids)) {
    query._id = {
      $and: [
        ...(size(params?.exclude_collection_ids) ? [{ $nin: params?.exclude_collection_ids }] : []),
        ...(size(params?.include_collection_ids) ? [{ $in: params?.include_collection_ids }] : [])
      ]
    }
  }

  const names = []

  if (Array.isArray(params?.names)) {
    names.push(...params.names)
  }
  if (params?.name) {
    names.push(params.name)
  }
  if (size(names)) {
    query.name = { $in: names }
  }

  return query
}

export const getARoleForQuery = async (params) => {
  const role = await getARole({ populate: ['permissions'], query: { _id: params?.collection_id } })
  if (!role?._id) {
    throw new CustomError(404, 'ROLE_NOT_FOUND')
  }

  return role
}

export const getRolesForQuery = async (queryParams = {}, options = {}) => {
  const { limit, skip, sort } = options || {}

  const query = prepareRoleQuery(queryParams)
  const data = await getRoles({
    limit,
    populate: ['permissions'],
    query,
    skip,
    sort
  })
  const filtered_rows = await countRoles(query)
  const total_rows = await countRoles({})

  return { data, meta_data: { filtered_rows, total_rows } }
}

export const getTopRoleOfAUser = (roles = []) => head(intersection(['admin', 'developer', 'moderator', 'user'], roles))

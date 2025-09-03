import { size } from 'lodash'

// Models
import { RoleUser } from 'src/modules/models'

// Utils
import { CustomError } from 'src/utils/error'

export const countRoleUsers = async (query) => RoleUser.countDocuments(query)

export const getARoleUser = async (options, session) => {
  const { populate, query, select, skip, sort } = options || {}

  return RoleUser.findOne(query, select, { populate, skip, sort }).session(session)
}

export const getRoleUsers = async (options, session) => {
  const { limit, populate, query, select, skip, sort } = options || {}

  return RoleUser.find(query, select, { limit, populate, skip, sort }).session(session)
}

export const prepareRoleUserQuery = (params) => {
  const query = {}

  if (size(params?.exclude_collection_ids) || size(params?.include_collection_ids)) {
    query._id = {
      $and: [
        ...(size(params?.exclude_collection_ids) ? [{ $nin: params?.exclude_collection_ids }] : []),
        ...(size(params?.include_collection_ids) ? [{ $in: params?.include_collection_ids }] : [])
      ]
    }
  }
  if (params?.role_id) {
    query.role_id = params.role_id
  }
  if (params?.user_id) {
    query.user_id = params.user_id
  }

  return query
}

export const getARoleUserForQuery = async (params) => {
  const roleUser = await getARoleUser({ populate: ['role', 'user'], query: { _id: params?.collection_id } })
  if (!roleUser?._id) {
    throw new CustomError(404, 'ROLE_USER_NOT_FOUND')
  }

  return roleUser
}

export const getRoleUsersForQuery = async (params) => {
  const { limit, skip, sort } = params?.options || {}

  const query = prepareRoleUserQuery(params?.query || {})
  const data = await getRoleUsers({
    limit,
    populate: ['role', 'user'],
    query,
    skip,
    sort
  })
  const filtered_rows = await countRoleUsers(query)
  const total_rows = await countRoleUsers({})

  return { data, meta_data: { filtered_rows, total_rows } }
}

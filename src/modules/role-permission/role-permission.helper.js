import { isBoolean, size } from 'lodash'

// Models
import { RolePermission } from 'src/modules/models'

// Utils
import { CustomError } from 'src/utils/error'

export const countRolePermissions = async (query) => RolePermission.countDocuments(query)

export const getARolePermission = async (options, session) => {
  const { populate, query, select, skip, sort } = options || {}

  return RolePermission.findOne(query, select, { populate, skip, sort }).session(session)
}

export const getRolePermissions = async (options, session) => {
  const { limit, populate, query, select, skip, sort } = options || {}

  return RolePermission.find(query, select, { limit, populate, skip, sort }).session(session)
}

export const prepareRolePermissionQuery = (params) => {
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
  if (params?.permission_id) {
    query.permission_id = params.permission_id
  }
  if (isBoolean(params?.can_do_the_action)) {
    query.can_do_the_action = params.can_do_the_action
  }

  return query
}

export const getARolePermissionForQuery = async (params) => {
  const rolePermission = await getARolePermission({
    populate: ['permission', 'role'],
    query: { _id: params?.collection_id }
  })
  if (!rolePermission?._id) {
    throw new CustomError(404, 'ROLE_PERMISSION_NOT_FOUND')
  }

  return rolePermission
}

export const getRolePermissionsForQuery = async (params) => {
  const { limit, skip, sort } = params?.options || {}

  const query = prepareRolePermissionQuery(params?.query || {})
  const data = await getRolePermissions({
    limit,
    populate: ['permission', 'role'],
    query,
    skip,
    sort
  })
  const filtered_rows = await countRolePermissions(query)
  const total_rows = await countRolePermissions({})

  return { data, meta_data: { filtered_rows, total_rows } }
}

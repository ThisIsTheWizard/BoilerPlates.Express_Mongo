import { isBoolean, size } from 'lodash'

// Models
import { RolePermission } from 'src/modules/models'

// Helpers
import { commonHelper } from 'src/modules/helpers'

// Utils
import { CustomError } from 'src/utils/error'

export const countRolePermissions = async (options) => RolePermission.countDocuments(options?.where)

export const getARolePermission = async (options, session) => RolePermission.findOne(options).session(session)

export const getRolePermissions = async (options, session) => RolePermission.find(options).session(session)

export const prepareRolePermissionQuery = (params) => {
  const query = {}

  if (size(params?.exclude_entity_ids) || size(params?.include_entity_ids)) {
    query._id = {
      $and: [
        ...(size(params?.exclude_entity_ids) ? [{ $nin: params?.exclude_entity_ids }] : []),
        ...(size(params?.include_entity_ids) ? [{ $in: params?.include_entity_ids }] : [])
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
  commonHelper.validateRequiredProps(['entity_id'], params)

  const rolePermission = await getARolePermission({ _id: params?.entity_id }).populate('permission').populate('role')
  if (!rolePermission?._id) {
    throw new CustomError(404, 'ROLE_PERMISSION_NOT_FOUND')
  }

  return rolePermission
}

export const getRolePermissionsForQuery = async (params, options) => {
  const { limit, skip, sort } = options || {}

  const where = prepareRolePermissionQuery(params)
  const data = await getRolePermissions({ where, limit, skip, sort }).populate('permission').populate('role')
  const filtered_rows = await countRolePermissions({ where })
  const total_rows = await countRolePermissions({})

  return { data, meta_data: { filtered_rows, total_rows } }
}

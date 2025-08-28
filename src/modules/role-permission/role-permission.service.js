import { head } from 'lodash'

// Models
import { RolePermission } from 'src/modules/models'

// Helpers
import { commonHelper, permissionHelper, roleHelper, rolePermissionHelper } from 'src/modules/helpers'

// Utils
import { CustomError } from 'src/utils/error'

export const createARolePermission = async (data, options, session) => {
  const rolePermissions = await RolePermission.create([data], { session })

  return head(rolePermissions)
}

export const createRolePermissions = async (data, options, session) => RolePermission.insertMany(data, { session })

export const updateARolePermission = async (options, data, session) => {
  const rolePermission = await rolePermissionHelper.getARolePermission(options, session)
  if (!rolePermission?._id) {
    throw new CustomError(404, 'ROLE_PERMISSION_NOT_FOUND')
  }

  Object.assign(rolePermission, data)
  await rolePermission.save({ session })

  return rolePermission
}

export const deleteARolePermission = async (options, session) => {
  const rolePermission = await rolePermissionHelper.getARolePermission(options, session)
  if (!rolePermission?._id) {
    throw new CustomError(404, 'ROLE_PERMISSION_NOT_FOUND')
  }

  await rolePermission.deleteOne({ session })

  return rolePermission
}

export const createARolePermissionForMutation = async (params, user, session) => {
  commonHelper.validateProps(
    [
      { field: 'can_do_the_action', required: true, type: 'boolean' },
      { field: 'permission_id', required: true, type: 'string' },
      { field: 'role_id', required: true, type: 'string' }
    ],
    params
  )

  const { can_do_the_action, permission_id, role_id } = params || {}

  const role = await roleHelper.getARole({ where: { _id: role_id } }, session)
  if (!role?._id) {
    throw new CustomError(404, 'ROLE_DOES_NOT_EXIST')
  }

  const permission = await permissionHelper.getAPermission({ where: { _id: permission_id } }, session)
  if (!permission?._id) {
    throw new CustomError(404, 'PERMISSION_DOES_NOT_EXIST')
  }

  const existingRolePerm = await rolePermissionHelper.getARolePermission({ permission_id, role_id }, session)
  if (existingRolePerm?._id) {
    throw new CustomError(400, 'ROLE_PERMISSION_ALREADY_EXISTS')
  }

  const rolePermission = await createARolePermission(
    { can_do_the_action, permission_id, role_id, created_by: user._id },
    null,
    session
  )

  return rolePermission
}

export const updateARolePermissionForMutation = async (params, user, session) => {
  commonHelper.validateProps(
    [
      { field: 'entity_id', required: true, type: 'string' },
      { field: 'can_do_the_action', required: true, type: 'boolean' }
    ],
    params
  )

  const { entity_id, can_do_the_action } = params || {}

  return updateARolePermission({ where: { _id: entity_id } }, { can_do_the_action, updated_by: user?._id }, session)
}

export const deleteARolePermissionForMutation = async (params, session) => {
  commonHelper.validateProps([{ field: 'entity_id', required: true, type: 'string' }], params)

  return deleteARolePermission({ where: { _id: params?.entity_id } }, session)
}

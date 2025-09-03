import { size } from 'lodash'

// Models
import { RolePermission } from 'src/modules/models'

// Helpers
import { permissionHelper, roleHelper, rolePermissionHelper } from 'src/modules/helpers'

// Utils
import { CustomError } from 'src/utils/error'

export const createARolePermission = async (data, session) => {
  const [rolePermission] = await RolePermission.create([data], { session })
  return rolePermission
}

export const updateARolePermission = async (options, data, session) => {
  const { query, skip, sort } = options || {}

  const rolePermission = await RolePermission.findOneAndUpdate(query, data, { new: true, skip, sort }).session(session)
  if (!rolePermission?._id) {
    throw new CustomError(404, 'ROLE_PERMISSION_NOT_FOUND')
  }

  return rolePermission
}

export const deleteARolePermission = async (options, session) => {
  const { query, skip, sort } = options || {}

  const rolePermission = await RolePermission.findOneAndDelete(query, { skip, sort }).session(session)
  if (!rolePermission?._id) {
    throw new CustomError(404, 'ROLE_PERMISSION_NOT_FOUND')
  }

  return rolePermission
}

export const createARolePermissionForMutation = async (params, user, session) => {
  const { can_do_the_action, permission_id, role_id } = params || {}

  const role = await roleHelper.getARole({ query: { _id: role_id } }, session)
  if (!role?._id) {
    throw new CustomError(404, 'ROLE_NOT_FOUND')
  }

  const permission = await permissionHelper.getAPermission({ query: { _id: permission_id } }, session)
  if (!permission?._id) {
    throw new CustomError(404, 'PERMISSION_NOT_FOUND')
  }

  const existingRolePerm = await rolePermissionHelper.getARolePermission({ query: { permission_id, role_id } }, session)
  if (existingRolePerm?._id) {
    throw new CustomError(400, 'ROLE_PERMISSION_ALREADY_EXISTS')
  }

  const rolePermission = await createARolePermission(
    { can_do_the_action, permission_id, role_id, created_by: user._id },
    session
  )
  if (!rolePermission?._id) {
    throw new CustomError(500, 'COULD_NOT_CREATE_ROLE_PERMISSION')
  }

  return rolePermission
}

export const updateARolePermissionForMutation = async (params, user, session) => {
  const { queryData, inputData } = params || {}
  const { can_do_the_action } = inputData || {}

  const updatingData = {}
  if (can_do_the_action) updatingData.can_do_the_action = can_do_the_action

  if (!size(updatingData)) {
    throw new CustomError(400, 'NO_DATA_TO_UPDATE')
  }

  return updateARolePermission({ query: { _id: queryData?.collection_id } }, updatingData, session)
}

export const deleteARolePermissionForMutation = async (query, user, session) =>
  deleteARolePermission({ query: { _id: query?.collection_id } }, session)

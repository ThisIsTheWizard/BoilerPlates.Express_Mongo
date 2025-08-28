import { head } from 'lodash'

// Models
import { Permission } from 'src/modules/models'

// Helpers
import { permissionHelper } from 'src/modules/helpers'

// Services
import {} from 'src/modules/services'

// Utils
import { CustomError } from 'src/utils/error'

export const createAPermission = async (data, options, session) => {
  const permissions = await Permission.create([data], { session })

  return head(permissions)
}

export const createPermissions = async (data, options, session) => Permission.insertMany(data, { session })

export const updateAPermission = async (options, data, session) => {
  const permission = await Permission.findOne(options.where).session(session)
  if (!permission?._id) throw new CustomError(404, 'PERMISSION_NOT_FOUND')

  permission.set(data)
  await permission.save({ session })

  return permission
}

export const deleteAPermission = async (options, session) => {
  const permission = await Permission.findOne(options.where).session(session)
  if (!permission?._id) throw new CustomError(404, 'PERMISSION_NOT_FOUND')

  await permission.deleteOne({ session })

  return permission
}

export const createAPermissionForMutation = async (params, user, session) => {
  const { action, module } = params || {}
  const permission = await createAPermission({ action, created_by: user?._id, module }, null, session)
  if (!permission?._id) throw new CustomError(500, 'COULD_NOT_CREATE_PERMISSION')

  return permission
}

export const updateAPermissionForMutation = async (params, session) => {
  const { data, entity_id } = params || {}
  const permission = await permissionHelper.getAPermission({ where: { _id: entity_id } }, session)
  if (!permission?._id) throw new CustomError(404, 'PERMISSION_NOT_FOUND')

  permission.set(data)
  await permission.save({ session })

  return permission
}

export const deleteAPermissionForMutation = async (params, session) => {
  const { entity_id } = params || {}
  const permission = await permissionHelper.getAPermission({ where: { _id: entity_id } }, session)
  if (!permission?._id) throw new CustomError(404, 'PERMISSION_NOT_FOUND')

  await permission.deleteOne({ session })

  return permission
}

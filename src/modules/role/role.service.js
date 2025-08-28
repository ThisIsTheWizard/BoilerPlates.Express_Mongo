import { head } from 'lodash'

// Models
import { Role } from 'src/modules/models'

// Helpers
import { roleHelper } from 'src/modules/helpers'

// Services
import {} from 'src/modules/services'

// Utils
import { CustomError } from 'src/utils/error'

export const createARole = async (data, options, session) => {
  const roles = await Role.create([data], { session })

  return head(roles)
}

export const createRoles = async (data, options, session) => Role.insertMany(data, { session })

export const updateARole = async (options, data, session) => {
  const role = await Role.findOne(options.where).session(session)
  if (!role?._id) throw new CustomError(404, 'ROLE_NOT_FOUND')

  role.set(data)
  await role.save({ session })

  return role
}

export const deleteARole = async (options, session) => {
  const role = await Role.findOne(options.where).session(session)
  if (!role?._id) throw new CustomError(404, 'ROLE_NOT_FOUND')

  await role.deleteOne({ session })

  return role
}

export const createARoleForMutation = async (params, user, session) => {
  const { name } = params || {}
  const role = await createARole({ created_by: user?._id, name }, null, session)
  if (!role?._id) throw new CustomError(500, 'COULD_NOT_CREATE_ROLE')

  return role
}

export const updateARoleForMutation = async (params, session) => {
  const { data, entity_id } = params || {}
  const role = await roleHelper.getARole({ where: { _id: entity_id } }, session)
  if (!role?._id) throw new CustomError(404, 'ROLE_NOT_FOUND')

  role.set(data)
  await role.save({ session })

  return role
}

export const deleteARoleForMutation = async (params, session) => {
  const { entity_id } = params || {}
  const role = await roleHelper.getARole({ where: { _id: entity_id } }, session)
  if (!role?._id) throw new CustomError(404, 'ROLE_NOT_FOUND')

  await role.deleteOne({ session })

  return role
}

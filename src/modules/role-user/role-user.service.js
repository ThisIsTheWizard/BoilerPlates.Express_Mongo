import { RoleUser } from 'src/modules/models'

// Helpers
import { commonHelper, roleHelper, roleUserHelper, userHelper } from 'src/modules/helpers'

// Services
import { roleUserService } from 'src/modules/services'

// Utils
import { head } from 'lodash'
import { CustomError } from 'src/utils/error'

export const createARoleUser = async (data, options, session) => {
  const roleUsers = await RoleUser.create([data], { session })

  return head(roleUsers)
}

export const updateARoleUser = async (options, data, session) => {
  const roleUser = await RoleUser.findOne(options.where).session(session)
  if (!roleUser?._id) throw new CustomError(404, 'ROLE_USER_NOT_FOUND')

  roleUser.set(data)
  await roleUser.save({ session })

  return roleUser
}

export const deleteARoleUser = async (options, session) => {
  const roleUser = await RoleUser.findOne(options.where).session(session)
  if (!roleUser?._id) throw new CustomError(404, 'ROLE_USER_NOT_FOUND')

  await roleUser.deleteOne({ session })

  return roleUser
}

export const createARoleUserForMutation = async (params, transaction) => {
  commonHelper.validateProps(
    [
      { field: 'role_id', required: true, type: 'string' },
      { field: 'user_id', required: true, type: 'string' }
    ],
    params
  )

  const { role_id, user_id } = params || {}

  const role = await roleHelper.getARole({ where: { _id: role_id } }, transaction)
  if (!role?._id) {
    throw new CustomError(404, 'ROLE_DOES_NOT_EXIST')
  }

  const user = await userHelper.getAUser({ where: { _id: user_id } }, transaction)
  if (!user?._id) {
    throw new CustomError(404, 'USER_DOES_NOT_EXIST')
  }

  const existingRoleUser = await roleUserHelper.getARoleUser({ role_id, user_id }, transaction)
  if (existingRoleUser?._id) {
    throw new CustomError(400, 'ROLE_USER_ALREADY_EXISTS')
  }

  return createARoleUser({ role_id, user_id }, null, transaction)
}

export const updateARoleUserForMutation = async (params, transaction) => {
  commonHelper.validateProps(
    [
      { field: 'entity_id', required: true, type: 'string' },
      { field: 'data', required: true, type: 'object' }
    ],
    params
  )
  commonHelper.validateProps(
    [
      { field: 'role_id', required: true, type: 'string' },
      { field: 'user_id', required: true, type: 'string' }
    ],
    params?.data
  )

  const { entity_id, data } = params || {}
  const { role_id, user_id } = data || {}

  const roleUser = await roleUserHelper.getARoleUser({ _id: entity_id }, transaction)
  if (!roleUser?._id) {
    throw new CustomError(404, 'ROLE_USER_DOES_NOT_EXIST')
  }

  if (role_id) {
    const role = await roleHelper.getARole({ where: { _id: role_id } }, transaction)
    if (!role?._id) {
      throw new CustomError(404, 'ROLE_DOES_NOT_EXIST')
    }
  }
  if (user_id) {
    const user = await userHelper.getAUser({ where: { _id: user_id } }, transaction)
    if (!user?._id) {
      throw new CustomError(404, 'USER_DOES_NOT_EXIST')
    }
  }

  const existingRoleUser = await roleUserHelper.getARoleUser(
    { role_id: role_id || roleUser?.role_id, user_id: user_id || roleUser?.user_id },
    transaction
  )
  if (existingRoleUser?._id) {
    throw new CustomError(400, 'ROLE_USER_ALREADY_EXISTS')
  }

  Object.assign(roleUser, params?.data)
  await roleUser.save({ session: transaction })

  return roleUser
}

export const deleteARoleUserForMutation = async (params, transaction) => {
  commonHelper.validateProps([{ field: 'entity_id', required: true, type: 'string' }], params)

  return deleteARoleUser({ where: { _id: params?.entity_id } }, transaction)
}

export const assignARoleToUserByName = async (params, transaction) => {
  commonHelper.validateRequiredProps(['role_name', 'user_id'], params)

  const roleUserCreationData = { user_id: params?.user_id }

  const role = await roleHelper.getARole({ where: { name: params?.role_name } }, transaction)
  if (!role?._id) {
    throw new CustomError(404, 'ROLE_DOES_NOT_EXIST')
  }

  roleUserCreationData.role_id = role._id

  return createARoleUser(roleUserCreationData, null, transaction)
}

export const revokeARoleFromUserByName = async (params, transaction) => {
  commonHelper.validateRequiredProps(['role_name', 'user_id'], params)

  const role = await roleHelper.getARole({ where: { name: params?.role_name } })
  if (!role?._id) {
    throw new CustomError(404, 'ROLE_DOES_NOT_EXIST')
  }

  const removedRoleUser = await roleUserService.deleteARoleUser(
    { where: { user_id: params?.user_id, role_id: role?._id } },
    transaction
  )
  if (!removedRoleUser?._id) {
    throw new CustomError(500, 'COULD_NOT_REMOVE_ROLE_USER')
  }

  return removedRoleUser
}

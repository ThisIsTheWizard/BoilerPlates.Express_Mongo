import { size } from 'lodash'

// Models
import { RoleUser } from 'src/modules/models'

// Helpers
import { roleHelper, userHelper } from 'src/modules/helpers'

// Utils
import { CustomError } from 'src/utils/error'

export const createARoleUser = async (data, session) => {
  const [roleUser] = await RoleUser.create([data], { session })
  return roleUser
}

export const updateARoleUser = async (options, data, session) => {
  const { query, skip, sort } = options || {}

  const roleUser = await RoleUser.findOneAndUpdate(query, data, { new: true, skip, sort }).session(session)
  if (!roleUser?._id) {
    throw new CustomError(404, 'ROLE_USER_NOT_FOUND')
  }

  return roleUser
}

export const deleteARoleUser = async (options, session) => {
  const { query, skip, sort } = options || {}

  const roleUser = await RoleUser.findOneAndDelete(query, { skip, sort }).session(session)
  if (!roleUser?._id) {
    throw new CustomError(404, 'ROLE_USER_NOT_FOUND')
  }

  return roleUser
}

export const createARoleUserForMutation = async (params, context_user, session) => {
  const { role_id, user_id } = params || {}

  const role = await roleHelper.getARole({ query: { _id: role_id } }, session)
  if (!role?._id) {
    throw new CustomError(404, 'ROLE_NOT_FOUND')
  }

  const user = await userHelper.getAUser({ query: { _id: user_id } }, session)
  if (!user?._id) {
    throw new CustomError(404, 'USER_NOT_FOUND')
  }

  const roleUser = await createARoleUser({ role_id, user_id }, session)
  if (!roleUser?._id) {
    throw new CustomError(500, 'COULD_NOT_CREATE_ROLE_USER')
  }

  return roleUser
}

export const updateARoleUserForMutation = async (params, user, session) => {
  const { queryData, inputData } = params || {}
  const { role_id, user_id } = inputData || {}

  const updatingData = {}
  if (role_id) updatingData.role_id = role_id
  if (user_id) updatingData.user_id = user_id

  if (!size(updatingData)) {
    throw new CustomError(400, 'NO_DATA_TO_UPDATE')
  }

  return updateARoleUser({ query: { _id: queryData?.collection_id } }, updatingData, session)
}

export const deleteARoleUserForMutation = async (query, user, session) =>
  deleteARoleUser({ query: { _id: query?.collection_id } }, session)

export const assignARoleToUserByName = async (params, session) => {
  const { role_name, user_id } = params || {}

  const role = await roleHelper.getARole({ query: { name: role_name } }, session)
  if (!role?._id) {
    throw new CustomError(404, 'ROLE_NOT_FOUND')
  }

  const roleUser = await createARoleUser({ role_id: role._id, user_id }, session)
  if (!roleUser?._id) {
    throw new CustomError(500, 'COULD_NOT_ASSIGN_ROLE_TO_USER')
  }

  return roleUser
}

export const revokeARoleFromUserByName = async (params, session) => {
  const { role_name, user_id } = params || {}

  const role = await roleHelper.getARole({ query: { name: role_name } }, session)
  if (!role?._id) {
    throw new CustomError(404, 'ROLE_NOT_FOUND')
  }

  const roleUser = await deleteARoleUser({ query: { role_id: role._id, user_id } }, session)
  if (!roleUser?._id) {
    throw new CustomError(500, 'COULD_NOT_REVOKE_ROLE_FROM_USER')
  }

  return roleUser
}

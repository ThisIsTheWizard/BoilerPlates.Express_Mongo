import { size } from 'lodash'

// Models
import { Role, User } from 'src/modules/models'

// Helpers
import { roleHelper } from 'src/modules/helpers'

// Services
import { userService } from 'src/modules/services'

// Utils
import { CustomError } from 'src/utils/error'

export const createARole = async (data, session) => {
  const [role] = await Role.create([data], { session })
  return role
}

export const updateARole = async (options, data, session) => {
  const { query, skip, sort } = options || {}

  const role = await Role.findOneAndUpdate(query, data, { new: true, skip, sort }).session(session)
  if (!role?._id) {
    throw new CustomError(404, 'ROLE_NOT_FOUND')
  }

  return role
}

export const deleteARole = async (options, session) => {
  const { query, skip, sort } = options || {}

  const role = await Role.findOneAndDelete(query, { skip, sort }).session(session)
  if (!role?._id) {
    throw new CustomError(404, 'ROLE_NOT_FOUND')
  }

  return role
}

export const createARoleForMutation = async (params, user, session) => {
  const { name } = params || {}

  const role = await createARole({ name, created_by: user?._id }, session)
  if (!role?._id) {
    throw new CustomError(500, 'COULD_NOT_CREATE_ROLE')
  }

  return role
}

export const updateARoleForMutation = async (params, user, session) => {
  const { queryData, inputData } = params || {}
  const { name } = inputData || {}

  const updatingData = {}
  if (name) updatingData.name = name

  if (!size(updatingData)) {
    throw new CustomError(400, 'NO_DATA_TO_UPDATE')
  }

  return updateARole({ query: { _id: queryData?.collection_id } }, updatingData, session)
}

export const deleteARoleForMutation = async (query, user, session) =>
  deleteARole({ query: { _id: query?.collection_id } }, session)

export const assignARoleToUserByName = async (params, session) => {
  const { role_name, user_id } = params || {}

  const role = await roleHelper.getARole({ query: { name: role_name } }, session)
  if (!role?._id) {
    throw new CustomError(404, 'ROLE_NOT_FOUND')
  }

  const user = await User.findOneAndUpdate({ _id: user_id }, { $addToSet: { roles: role._id } }, { new: true }).session(
    session
  )
  if (!user?._id) {
    throw new CustomError(500, 'COULD_NOT_ASSIGN_ROLE_TO_USER')
  }

  return user
}

export const revokeARoleFromUserByName = async (params, session) => {
  const { role_name, user_id } = params || {}

  const role = await roleHelper.getARole({ query: { name: role_name } }, session)
  if (!role?._id) {
    throw new CustomError(404, 'ROLE_NOT_FOUND')
  }

  const user = await userService.updateAUser({ query: { _id: user_id } }, { $pull: { roles: role._id } }, session)
  if (!user?._id) {
    throw new CustomError(500, 'COULD_NOT_REVOKE_ROLE_FROM_USER')
  }

  return user
}

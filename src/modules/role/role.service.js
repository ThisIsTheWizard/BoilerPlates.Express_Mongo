import { size } from 'lodash'

// Models
import { Role } from 'src/modules/models'

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
  const { query, sort } = options || {}

  const role = await Role.findOneAndUpdate(query, data, { new: true, sort }).session(session)
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
  const { collection_id, data } = params || {}
  const { name } = data || {}

  const updatingData = {}
  if (name) updatingData.name = name

  if (!size(updatingData)) {
    throw new CustomError(400, 'NO_DATA_TO_UPDATE')
  }

  return updateARole({ query: { _id: collection_id } }, updatingData, session)
}

export const deleteARoleForMutation = async (query, user, session) =>
  deleteARole({ query: { _id: query?.collection_id } }, session)

export const assignARoleToUserByName = async (params, session) => {
  const { role_name, user_id } = params || {}

  const role = await roleHelper.getARole({ query: { name: role_name } }, session)
  if (!role?._id) {
    throw new CustomError(404, 'ROLE_NOT_FOUND')
  }

  const user = await userService.updateAUser({ query: { _id: user_id } }, { $addToSet: { roles: role._id } }, session)
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

export const updateRolePermissions = async (params, user, session) => {
  const { collection_id, data } = params || {}
  const { can_do_the_action, permission_id } = data || {}

  const role = await roleHelper.getARole({ query: { _id: collection_id } }, session)
  if (!role?._id) {
    throw new CustomError(404, 'ROLE_NOT_FOUND')
  }

  const roleWithExistingPermission = await roleHelper.getARole(
    { query: { _id: collection_id, 'permissions.permission_id': permission_id } },
    session
  )

  const updatingData = {}
  if (roleWithExistingPermission?._id) {
    updatingData['permissions.$.can_do_the_action'] = can_do_the_action
    updatingData['permissions.$.updated_by'] = user?.user_id
  } else {
    updatingData['$push'] = {
      permissions: {
        can_do_the_action,
        created_by: user?.user_id,
        permission_id,
        updated_by: user?.user_id
      }
    }
  }

  return updateARole(
    { query: { _id: collection_id, 'permissions.permission_id': permission_id } },
    updatingData,
    session
  )
}

import { size } from 'lodash'

// Models
import { Permission } from 'src/modules/models'

// Utils
import { CustomError } from 'src/utils/error'

export const createAPermission = async (data, session) => {
  const [permission] = await Permission.create([data], { session })
  return permission
}

export const updateAPermission = async (options, data, session) => {
  const { query, skip, sort } = options || {}

  const permission = await Permission.findOneAndUpdate(query, data, { new: true, skip, sort }).session(session)
  if (!permission?._id) {
    throw new CustomError(404, 'PERMISSION_NOT_FOUND')
  }

  return permission
}

export const deleteAPermission = async (options, session) => {
  const { query, skip, sort } = options || {}

  const permission = await Permission.findOneAndDelete(query, { skip, sort }).session(session)
  if (!permission?._id) {
    throw new CustomError(404, 'PERMISSION_NOT_FOUND')
  }

  return permission
}

export const createAPermissionForMutation = async (params, user, session) => {
  const { action, module } = params || {}

  const permission = await createAPermission({ action, created_by: user?._id, module }, session)
  if (!permission?._id) {
    throw new CustomError(500, 'COULD_NOT_CREATE_PERMISSION')
  }

  return permission
}

export const updateAPermissionForMutation = async (params, user, session) => {
  const { queryData, inputData } = params || {}
  const { action, module } = inputData || {}

  const updatingData = {}
  if (action) updatingData.action = action
  if (module) updatingData.module = module

  if (!size(updatingData)) {
    throw new CustomError(400, 'NO_DATA_TO_UPDATE')
  }

  return updateAPermission({ query: { _id: queryData?.collection_id } }, updatingData, session)
}

export const deleteAPermissionForMutation = async (query, user, session) =>
  deleteAPermission({ query: { _id: query?.collection_id } }, session)

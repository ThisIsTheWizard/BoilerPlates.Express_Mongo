import { size } from 'lodash'

// Models
import { Permission } from 'src/modules/models'

// Utils
import { CustomError } from 'src/utils/error'

export const countPermissions = async (query) => Permission.countDocuments(query)

export const getAPermission = async (options, session) => {
  const { populate, query, select, skip, sort } = options || {}

  return Permission.findOne(query, select, { populate, skip, sort }).session(session)
}

export const getPermissions = async (options, session) => {
  const { limit, populate, query, select, skip, sort } = options || {}

  return Permission.find(query, select, { limit, populate, skip, sort }).session(session)
}

export const preparePermissionQuery = (params = {}) => {
  const query = {}

  if (params?.action) query.action = params.action
  if (size(params?.exclude_collection_ids) || size(params?.include_collection_ids)) {
    query._id = {
      $and: [
        ...(size(params?.exclude_collection_ids) ? [{ $nin: params?.exclude_collection_ids }] : []),
        ...(size(params?.include_collection_ids) ? [{ $in: params?.include_collection_ids }] : [])
      ]
    }
  }
  if (params?.module) query.module = params.module

  return query
}

export const getAPermissionForQuery = async (params) => {
  const permission = await getAPermission({ query: { _id: params?.collection_id } })
  if (!permission?._id) {
    throw new CustomError(404, 'PERMISSION_NOT_FOUND')
  }

  return permission
}

export const getPermissionsForQuery = async (params) => {
  const { limit, skip, sort } = params?.options || {}

  const query = preparePermissionQuery(params?.query || {})
  const data = await getPermissions({
    limit,
    skip,
    sort,
    query
  })
  const filtered_rows = await countPermissions(query)
  const total_rows = await countPermissions({})

  return { data, meta_data: { filtered_rows, total_rows } }
}

import { size } from 'lodash'

// Models
import { Permission } from 'src/modules/models'

// Helpers
import { commonHelper } from 'src/modules/helpers'

// Utils
import { CustomError } from 'src/utils/error'

export const countPermissions = async (options, session) => Permission.countDocuments(options?.where).session(session)

export const getAPermission = async (options, session) => Permission.findOne(options?.where).session(session)

export const getPermissions = async (options, session) => Permission.find(options?.where).session(session)

export const preparePermissionQuery = (params = {}) => {
  const query = {}

  if (params?.action) query.action = params?.action
  if (size(params?.exclude_entity_ids) || size(params?.include_entity_ids)) {
    query._id = {
      $and: [
        ...(size(params?.exclude_entity_ids) ? [{ $nin: params?.exclude_entity_ids }] : []),
        ...(size(params?.include_entity_ids) ? [{ $in: params?.include_entity_ids }] : [])
      ]
    }
  }
  if (params?.module) query.module = params?.module

  return query
}

export const getAPermissionForQuery = async (query) => {
  commonHelper.validateRequiredProps(['entity_id'], query)

  const permission = await getAPermission({ where: { _id: query.entity_id } })
  if (!permission?._id) {
    throw new CustomError(404, 'PERMISSION_NOT_FOUND')
  }

  return permission
}

export const getPermissionsForQuery = async (query, options) => {
  // TODO: Implement this with populate and aggregation
  const { limit, skip, sort } = options || {}

  const where = preparePermissionQuery(query)
  const permissions = await getPermissions({
    where,
    limit,
    skip,
    sort
  })
  const filtered_rows = await countPermissions({ where })
  const total_rows = await countPermissions({ where: {} })

  return { data: JSON.parse(JSON.stringify(permissions)), meta_data: { filtered_rows, total_rows } }
}

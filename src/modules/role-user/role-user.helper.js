import { size } from 'lodash'

// Models
import { RoleUser } from 'src/modules/models'

// Helpers
import { commonHelper } from 'src/modules/helpers'

// Utils
import { CustomError } from 'src/utils/error'

export const countRoleUsers = async (options, session) => RoleUser.countDocuments(options).session(session)

export const getARoleUser = async (options, session) => RoleUser.findOne(options).session(session)

export const getRoleUsers = async (options, session) => RoleUser.find(options).session(session)

export const prepareRoleUserQuery = (params) => {
  const query = {}

  if (size(params?.exclude_entity_ids) || size(params?.include_entity_ids)) {
    query._id = {
      $and: [
        ...(size(params?.exclude_entity_ids) ? [{ $nin: params?.exclude_entity_ids }] : []),
        ...(size(params?.include_entity_ids) ? [{ $in: params?.include_entity_ids }] : [])
      ]
    }
  }
  if (params?.role_id) {
    query.role_id = params.role_id
  }
  if (params?.user_id) {
    query.user_id = params.user_id
  }

  return query
}

export const getARoleUserForQuery = async (params) => {
  commonHelper.validateProps([{ field: 'entity_id', required: true, type: 'string' }], params)

  const roleUser = await getARoleUser({ _id: params?.entity_id }).populate('role').populate('user')
  if (!roleUser?._id) {
    throw new CustomError(404, 'ROLE_USER_DOES_NOT_EXIST')
  }

  return roleUser
}

export const getRoleUsersForQuery = async (params, options) => {
  const { limit, skip, sort } = options || {}

  const where = prepareRoleUserQuery(params)
  const data = await getRoleUsers({ where, limit, skip, sort }).populate('role').populate('user')
  const filtered_rows = await countRoleUsers({ where })
  const total_rows = await countRoleUsers({})

  return { data, meta_data: { filtered_rows, total_rows } }
}

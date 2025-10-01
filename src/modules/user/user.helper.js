import { find, join, map, size } from 'lodash'

// Models
import { User } from 'src/modules/models'

// Helpers
import { commonHelper, roleHelper } from 'src/modules/helpers'

export const countUsers = async (query) => User.countDocuments(query)

export const getAUser = async (options, session) => {
  const { populate, query, select, skip, sort } = options || {}

  return User.findOne(query, select, { populate, skip, sort }).session(session)
}

export const getUsers = async (options, session) => {
  const { limit, populate, query, select, skip, sort } = options || {}

  return User.find(query, select, { limit, populate, skip, sort }).session(session)
}

export const prepareUsersQuery = (params) => {
  const { email, search_keyword, status } = params || {}

  const query = {}
  if (email) query.email = email?.toLowerCase?.()
  if (search_keyword) {
    query.$or = [
      { email: { $regex: search_keyword, $options: 'i' } },
      { first_name: { $regex: search_keyword, $options: 'i' } },
      { last_name: { $regex: search_keyword, $options: 'i' } }
    ]
  }
  if (status) query.status = status

  return query
}

export const getAUserForQuery = async (query) => {
  commonHelper.checkRequiredFields(['collection_id'], query)

  return getAUser({ query: { _id: query.collection_id }, select: 'id email first_name last_name status' })
}

export const getUsersForQuery = async (params, options) => {
  const { limit, skip, sort } = options || {}

  const where = prepareUsersQuery(params)
  const users = await getUsers({
    where,
    limit,
    skip,
    sort
  })
  const filtered_rows = await countUsers({ where })
  const total_rows = await countUsers({})

  return { data: JSON.parse(JSON.stringify(users)), meta_data: { filtered_rows, total_rows } }
}

export const getAuthUserWithRolesAndPermissions = async ({ roles, user_id }) => {
  if (!commonHelper.validateUUID(user_id)) {
    throw new Error('INVALID_USER_ID')
  }

  const user = await User.findOne({ _id: user_id }).populate({
    path: 'roles',
    match: { name: { $in: roles || [] } },
    populate: {
      path: 'permissions'
    }
  })

  if (!user?._id) {
    throw new Error('USER_NOT_FOUND')
  }

  const result = JSON.parse(JSON.stringify(user))
  const roleNames = map(user?.roles, 'name')
  const topRole = roleHelper.getTopRoleOfAUser(roleNames)

  result.roles = roleNames
  result.role = topRole
  const roleWithPermissions = find(user?.roles, (role) => role?.name === topRole)
  result.permissions = roleWithPermissions?.permissions || []
  result.user_id = user._id

  return result
}

export const getUsernameByNames = (email, first_name, last_name) => {
  const strings = []

  if (first_name) strings.push(first_name)
  if (last_name) strings.push(last_name)

  // If names are empty, use email as username
  if (email && !size(strings)) {
    strings.push(email)
  }

  return join(strings, ' ')
}

export const getAUserWithPassword = async (options) => User.findOne(options?.where).select('+password')

import { map, omit, pick, size, slice } from 'lodash'
import moment from 'moment-timezone'

// Models
import { User } from 'src/modules/models'

// Helpers
import { commonHelper, userHelper, verificationTokenHelper } from 'src/modules/helpers'

// Services
import { authTokenService, commonService, roleService, verificationTokenService } from 'src/modules/services'

// Utils
import { CustomError } from 'src/utils/error'

export const createAUser = async (data, session) => {
  const [user] = await User.create([data], { session })
  return user
}

export const updateAUser = async (options, data, session) => {
  const { query, sort } = options || {}

  const user = await User.findOneAndUpdate(query, data, { new: true, sort }).session(session)
  if (!user?._id) {
    throw new CustomError(404, 'USER_NOT_FOUND')
  }

  return user
}

export const deleteAUser = async (options, session) => {
  const { query, skip, sort } = options || {}

  const user = await User.findOneAndDelete(query, { skip, sort }).session(session)
  if (!user?._id) {
    throw new CustomError(404, 'USER_NOT_FOUND')
  }

  return user
}

export const registerUser = async (params = {}, session) => {
  commonHelper.validateProps(
    [
      { field: 'email', required: true, type: 'string' },
      { field: 'first_name', required: true, type: 'string' },
      { field: 'last_name', required: true, type: 'string' },
      { field: 'password', required: true, type: 'string' }
    ],
    params
  )

  const { email, first_name, last_name, password } = params || {}
  if (!commonHelper.validatePassword(password)) {
    throw new Error('PASSWORD_DID_NOT_CONFORM_OUR_POLICY')
  }

  const existingUser = await userHelper.getAUser({ query: { email }, select: 'id' }, session)
  if (existingUser?._id) {
    throw new Error('EMAIL_IS_ALREADY_ASSOCIATED_WITH_A_USER')
  }

  const user = await createAUser(
    { email, first_name, last_name, password: commonService.generateHashPassword(password) },
    session
  )
  if (!user?._id) {
    throw new Error('COULD_NOT_CREATE_USER')
  }

  await roleService.assignARoleToUserByName({ role_name: 'user', user_id: user?._id }, session)

  await verificationTokenService.createAVerificationTokenForUser(
    { ...pick(user, ['email', 'first_name', 'last_name']), type: 'user_verification', user_id: user?._id },
    session
  )

  return omit(user, ['created_at', 'new_email', 'old_passwords', 'password', 'updated_at'])
}

export const verifyUserEmail = async (params = {}, session) => {
  commonHelper.validateProps(
    [
      { field: 'email', required: true, type: 'string' },
      { field: 'token', required: true, type: 'string' }
    ],
    params
  )

  const { email, token } = params || {}

  await verificationTokenService.validateVerificationTokenForUser({ email, token, type: 'user_verification' }, session)

  const user = await updateAUser({ query: { email } }, { status: 'active' }, session)

  return omit(user, ['created_at', 'new_email', 'old_passwords', 'password', 'updated_at'])
}

export const resendUserVerificationEmail = async (params = {}, session) => {
  commonHelper.validateProps([{ field: 'email', required: true, type: 'string' }], params)

  const { email } = params || {}
  const user = await userHelper.getAUser({ query: { $or: [{ email }, { new_email: email }] } }, session)
  if (!user?._id) {
    throw new Error('USER_NOT_FOUND')
  }
  if (!(user?.status === 'unverified') && !user?.new_email) {
    throw new Error('USER_IS_ALREADY_VERIFIED')
  }

  const existingTokens = await verificationTokenHelper.getVerificationTokens(
    {
      user_id: user?._id,
      type: 'user_verification',
      status: { $in: ['cancelled', 'unverified'] },
      created_at: { $gte: moment().subtract(10, 'minutes').toDate() }
    },
    { sort: { created_at: -1 }, session }
  )
  if (size(existingTokens) >= 3) {
    throw new Error('TOO_MANY_RESEND_VERIFICATION_REQUESTS')
  }

  await verificationTokenService.updateVerificationTokens(
    { user_id: user?._id, type: 'user_verification', status: 'unverified' },
    { status: 'cancelled' },
    session
  )

  await verificationTokenService.createAVerificationTokenForUser(
    { ...pick(user, ['email', 'first_name', 'last_name']), type: 'user_verification', user_id: user?._id },
    session
  )

  return omit(user, ['created_at', 'new_email', 'old_passwords', 'password', 'updated_at'])
}

export const loginUser = async (params = {}, session) => {
  commonHelper.validateProps(
    [
      { field: 'email', required: true, type: 'string' },
      { field: 'password', required: true, type: 'string' }
    ],
    params
  )

  const { email, password } = params || {}

  const user = await userHelper.getAUser({ populate: 'roles', query: { email } }, session)
  if (!user?._id) {
    throw new Error('USER_NOT_FOUND')
  }
  if (!(user?.status === 'active')) {
    throw new Error(`USER_IS_${user?.status?.toUpperCase?.()}`)
  }
  if (!commonService.compareHashPassword(password, user?.password)) {
    throw new Error('PASSWORD_IS_INCORRECT')
  }

  return authTokenService.createAuthTokensForUser({ roles: map(user?.roles, 'name'), user_id: user?._id }, session)
}

export const logoutAUser = async (params, session) => authTokenService.revokeAnAuthTokenForUser(params, session)

export const verifyTokenForUser = async (params, session) => authTokenService.verifyAnAuthTokenForUser(params, session)

export const refreshTokensForUser = async (params = {}, session) => {
  commonHelper.validateProps(
    [
      { field: 'access_token', required: true, type: 'string' },
      { field: 'refresh_token', required: true, type: 'string' }
    ],
    params
  )

  const { access_token, refresh_token } = params || {}
  const { user_id } = commonService.decodeJWTToken(access_token) || {}

  const user = await userHelper.getAUser({ populate: 'roles', query: { _id: user_id } }, session)

  return authTokenService.refreshAuthTokensForUser({ refresh_token, roles: map(user?.roles, 'name'), user_id }, session)
}

export const changeEmailByUser = async (params = {}, session) => {
  commonHelper.validateProps(
    [
      { field: 'new_email', required: true, type: 'string' },
      { field: 'user_id', required: true, type: 'string' }
    ],
    params
  )

  const { new_email, user_id } = params || {}

  if (!commonHelper.validateEmail(new_email)) {
    throw new Error('EMAIL_IS_INVALID')
  }

  const existingUser = await userHelper.getAUser({ query: { $or: [{ email: new_email }, { new_email }] } }, session)
  if (existingUser?._id) {
    throw new Error('NEW_EMAIL_IS_ALREADY_ASSOCIATED_WITH_A_USER')
  }

  const user = await updateAUser({ query: { _id: user_id } }, { new_email }, session)
  if (!(user?.status === 'active')) {
    throw new Error(`USER_IS_${user?.status?.toUpperCase?.()}`)
  }

  await verificationTokenService.deleteVerificationTokens(
    {
      email: new_email,
      status: { $in: ['cancelled', 'unverified'] },
      type: 'user_verification',
      user_id
    },
    session
  )

  await verificationTokenService.createAVerificationTokenForUser(
    { ...pick(user, ['first_name', 'last_name']), email: new_email, type: 'user_verification', user_id },
    session
  )

  return omit(user, ['created_at', 'new_email', 'old_passwords', 'password', 'updated_at'])
}

export const cancelChangeEmailByUser = async (params, session) => {
  commonHelper.validateProps([{ field: 'email', required: true, type: 'string' }], params)

  const { email } = params || {}

  const user = await updateAUser({ query: { new_email: email } }, { new_email: null }, session)
  if (!(user?.status === 'active')) {
    throw new Error(`USER_IS_${user?.status?.toUpperCase?.()}`)
  }

  const deletedTokens = await verificationTokenService.deleteVerificationTokens(
    {
      email,
      status: { $in: ['cancelled', 'unverified'] },
      type: 'user_verification',
      user_id: user?._id
    },
    session
  )
  if (deletedTokens <= 0) {
    throw new Error('NO_CHANGE_EMAIL_REQUEST_IS_FOUND')
  }

  return omit(user, ['created_at', 'new_email', 'old_passwords', 'password', 'updated_at'])
}

export const verifyChangeEmailByUser = async (params = {}, session) => {
  commonHelper.validateProps(
    [
      { field: 'token', required: true, type: 'string' },
      { field: 'user_id', required: true, type: 'string' }
    ],
    params
  )

  const { token, user_id } = params || {}

  await verificationTokenService.validateVerificationTokenForUser(
    { token, type: 'user_verification', user_id },
    session
  )

  const existingUser = await userHelper.getAUser({ query: { _id: user_id } }, session)
  if (!existingUser?._id) {
    throw new Error('USER_NOT_FOUND')
  }

  const newEmail = existingUser?.new_email
  if (!newEmail) {
    throw new Error('NEW_EMAIL_IS_NOT_FOUND')
  }

  const user = await updateAUser({ query: { _id: user_id } }, { email: newEmail, new_email: null }, session)
  if (!(user?.status === 'active')) {
    throw new Error(`USER_IS_${user?.status?.toUpperCase?.()}`)
  }

  return omit(user, ['created_at', 'new_email', 'old_passwords', 'password', 'updated_at'])
}

export const setUserEmailByAdmin = async (params = {}, session) => {
  commonHelper.validateProps(
    [
      { field: 'new_email', required: true, type: 'string' },
      { field: 'user_id', required: true, type: 'string' }
    ],
    params
  )

  const { new_email, user_id } = params || {}

  const existingUser = await userHelper.getAUser({ query: { $or: [{ email: new_email }, { new_email }] } }, session)
  if (existingUser?._id) {
    throw new Error('NEW_EMAIL_IS_ALREADY_ASSOCIATED_WITH_A_USER')
  }

  const user = await updateAUser({ query: { _id: user_id } }, { email: new_email, new_email: null }, session)

  return omit(user, ['created_at', 'new_email', 'old_passwords', 'password', 'updated_at'])
}

export const changePasswordByUser = async (params = {}, session) => {
  commonHelper.validateProps(
    [
      { field: 'new_password', required: true, type: 'string' },
      { field: 'old_password', required: true, type: 'string' },
      { field: 'user_id', required: true, type: 'string' }
    ],
    params
  )

  const { new_password, old_password, user_id } = params || {}

  if (new_password === old_password) {
    throw new Error('NEW_PASSWORD_IS_SAME_AS_OLD_PASSWORD')
  }

  const user = await userHelper.getAUser({ query: { _id: user_id } }, session)
  if (!user?._id) {
    throw new Error('USER_NOT_FOUND')
  }
  if (!(user?.status === 'active')) {
    throw new Error(`USER_IS_${user?.status?.toUpperCase?.()}`)
  }
  if (!commonHelper.validatePassword(new_password)) {
    throw new Error('PASSWORD_DID_NOT_CONFORM_OUR_POLICY')
  }
  // Check for old passwords
  if (!commonService.compareHashPassword(old_password, user?.password)) {
    throw new Error('OLD_PASSWORD_IS_INCORRECT')
  }
  if (commonService.checkOldPasswords(new_password, user?.old_passwords)) {
    throw new Error('PASSWORD_IS_ALREADY_USED_BEFORE')
  }

  const password = commonService.generateHashPassword(new_password)

  await updateAUser(
    { query: { _id: user_id } },
    { old_passwords: [...slice(user.old_passwords, 1, 3), password], password },
    session
  )

  await authTokenService.deleteAuthTokens({ query: { user_id } }, session)

  return omit(user, ['created_at', 'new_email', 'old_passwords', 'password', 'updated_at'])
}

export const changePasswordByAdmin = async (params = {}, session) => {
  commonHelper.validateProps(
    [
      { field: 'password', required: true, type: 'string' },
      { field: 'user_id', required: true, type: 'string' }
    ],
    params
  )

  const { password, user_id } = params || {}

  const user = await userHelper.getAUser({ query: { _id: user_id } }, session)
  if (!user?._id) {
    throw new Error('USER_NOT_FOUND')
  }

  const hashPassword = commonService.generateHashPassword(password)

  await updateAUser(
    { query: { _id: user_id } },
    { old_passwords: [...slice(user.old_passwords, 1, 3), hashPassword], password: hashPassword },
    session
  )

  await authTokenService.deleteAuthTokens({ query: { user_id } }, session)

  return omit(user, ['created_at', 'new_email', 'old_passwords', 'password', 'updated_at'])
}

export const forgotPassword = async (params = {}, session) => {
  commonHelper.validateProps([{ field: 'email', required: true, type: 'string' }], params)

  const { email } = params || {}

  const user = await userHelper.getAUser({ query: { email } }, session)
  if (!user?._id) {
    throw new Error('USER_NOT_FOUND')
  }

  const existingTokens = await verificationTokenHelper.getVerificationTokens(
    {
      email,
      user_id: user?._id,
      type: 'forgot_password',
      status: { $in: ['cancelled', 'unverified'] },
      created_at: { $gte: moment().subtract(10, 'minutes').toDate() }
    },
    { sort: { created_at: -1 }, session }
  )
  if (size(existingTokens) >= 3) {
    throw new Error('TOO_MANY_FORGOT_PASSWORD_REQUESTS')
  }

  await verificationTokenService.updateVerificationTokens(
    { email, user_id: user?._id, type: 'forgot_password', status: 'unverified' },
    { status: 'cancelled' },
    session
  )
  await verificationTokenService.createAVerificationTokenForUser(
    { ...pick(user, ['first_name', 'last_name']), email, type: 'forgot_password', user_id: user?._id },
    session
  )

  return omit(user, ['created_at', 'new_email', 'old_passwords', 'password', 'updated_at'])
}

export const retryForgotPassword = async (params = {}, session) => {
  commonHelper.validateProps([{ field: 'email', required: true, type: 'string' }], params)

  const { email } = params || {}

  const user = await userHelper.getAUser({ query: { email } }, session)
  if (!user?._id) {
    throw new Error('USER_NOT_FOUND')
  }

  const existingTokens = await verificationTokenHelper.getVerificationTokens(
    {
      email,
      user_id: user?._id,
      type: 'forgot_password',
      status: { $in: ['cancelled', 'unverified'] },
      created_at: { $gte: moment().subtract(10, 'minutes').toDate() }
    },
    { sort: { created_at: -1 }, session }
  )
  if (size(existingTokens) >= 3) {
    throw new Error('TOO_MANY_FORGOT_PASSWORD_REQUESTS')
  }

  await verificationTokenService.updateVerificationTokens(
    { email, user_id: user?._id, type: 'forgot_password', status: 'unverified' },
    { status: 'cancelled' },
    session
  )
  await verificationTokenService.createAVerificationTokenForUser(
    { ...pick(user, ['first_name', 'last_name']), email, type: 'forgot_password', user_id: user?._id },
    session
  )

  return omit(user, ['created_at', 'new_email', 'old_passwords', 'password', 'updated_at'])
}

export const verifyForgotPasswordCode = async (params = {}, session) => {
  commonHelper.validateProps(
    [
      { field: 'email', required: true, type: 'string' },
      { field: 'token', required: true, type: 'string' }
    ],
    params
  )

  const { email, token } = params || {}
  const verificationToken = await verificationTokenHelper.getAVerificationToken(
    { email, status: 'unverified', token, type: 'forgot_password' },
    session
  )
  if (!verificationToken?._id) {
    throw new Error('OTP_IS_NOT_VALID')
  }
  if (moment(verificationToken?.expired_at).isBefore(moment())) {
    throw new Error('OTP_IS_EXPIRED')
  }

  return { message: 'OTP_IS_VALID', success: true }
}

export const verifyForgotPassword = async (params = {}, session) => {
  commonHelper.validateProps(
    [
      { field: 'email', required: true, type: 'string' },
      { field: 'password', required: true, type: 'string' },
      { field: 'token', required: true, type: 'string' }
    ],
    params
  )

  const { email, password, token } = params || {}

  await verificationTokenService.validateVerificationTokenForUser({ email, token, type: 'forgot_password' }, session)

  const user = await userHelper.getAUser({ query: { email } }, session)
  if (!user?._id) {
    throw new Error('USER_IS_NOT_FOUND')
  }
  if (!commonHelper.validatePassword(password)) {
    throw new Error('PASSWORD_DID_NOT_CONFORM_OUR_POLICY')
  }
  // Check for old passwords
  if (commonService.compareHashPassword(password, user?.password)) {
    throw new Error('PASSWORD_IS_ALREADY_USED_BEFORE')
  }
  if (commonService.checkOldPasswords(password, user?.old_passwords)) {
    throw new Error('PASSWORD_IS_ALREADY_USED_BEFORE')
  }

  const hashPassword = commonService.generateHashPassword(password)

  await updateAUser(
    { query: { _id: user?._id } },
    { old_passwords: [...slice(user.old_passwords, 1, 3), hashPassword], password: hashPassword },
    session
  )

  await authTokenService.deleteAuthTokens({ query: { user_id: user?._id } }, session)

  return omit(user, ['created_at', 'new_email', 'old_passwords', 'password', 'updated_at'])
}

export const verifyUserPassword = async (params = {}, session) => {
  commonHelper.validateProps(
    [
      { field: 'password', required: true, type: 'string' },
      { field: 'user_id', required: true, type: 'string' }
    ],
    params
  )

  const { password, user_id } = params || {}

  const user = await userHelper.getAUser({ query: { _id: user_id } }, session)
  if (!user?._id) {
    throw new Error('USER_IS_NOT_FOUND')
  }
  if (!(user?.status === 'active')) {
    throw new Error(`USER_IS_${user?.status?.toUpperCase?.()}`)
  }
  if (!commonService.compareHashPassword(password, user?.password)) {
    return { message: 'PASSWORD_IS_INCORRECT', success: false }
  }

  return { message: 'PASSWORD_IS_CORRECT', success: true }
}

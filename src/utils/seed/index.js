// Seeders
import { seedAuthTemplates } from 'src/utils/seed/auth-template.seed'
import { seedRoles } from 'src/utils/seed/role.seed'
import { seedTestUsers } from 'src/utils/seed/user.seed'

// Helpers
import { verificationTokenHelper } from 'src/modules/helpers'

export const startDBSetupForTesting = async (req, res, next) => {
  try {
    console.log('Calling seedAuthTemplates', new Date().toISOString())
    await seedAuthTemplates()

    console.log('Calling seedRoles', new Date().toISOString())
    const roles = await seedRoles()

    console.log('Calling seedTestUser', new Date().toISOString())
    await seedTestUsers(roles)

    res.status(200).json({ message: 'SUCCESS' })
  } catch (error) {
    next(error)
  }
}

export const getLatestVerificationTokenForTesting = async (req, res, next) => {
  try {
    const { email, status = 'unverified', type, user_id: userId } = req.query || {}

    const query = {}
    if (email) query.email = email
    if (status) query.status = status
    if (type) query.type = type
    if (userId) query.user_id = userId

    const token = await verificationTokenHelper.getAVerificationToken({
      query,
      sort: { created_at: -1 }
    })

    if (!token?._id) {
      return res.status(404).json({ message: 'VERIFICATION_TOKEN_NOT_FOUND' })
    }

    return res.status(200).json({ data: JSON.parse(JSON.stringify(token)), message: 'SUCCESS' })
  } catch (error) {
    next(error)
  }
}

export { seedAuthTemplates, seedRoles }

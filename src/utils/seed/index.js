// Seeders
import { seedAuthTemplates } from 'src/utils/seed/auth-template.seed'
import { seedRoles } from 'src/utils/seed/role.seed'
import { seedTestUsers } from 'src/utils/seed/user.seed'

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

export { seedAuthTemplates, seedRoles }

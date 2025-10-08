import { Role } from 'src/modules/models'

export const seedRoles = async () => {
  const count = await Role.countDocuments({ name: { $in: ['admin', 'developer', 'moderator', 'user'] } })
  if (count > 0) {
    console.log('Roles already seeded. Skipping seeding.')
    return
  }

  return Role.insertMany([{ name: 'admin' }, { name: 'developer' }, { name: 'moderator' }, { name: 'user' }])
}

import { Role } from 'src/modules/models'

export const seedRoles = async () =>
  Role.insertMany([{ name: 'admin' }, { name: 'developer' }, { name: 'moderator' }, { name: 'user' }])

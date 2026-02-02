import { filter, map } from 'lodash'

// Models
import { User } from 'src/modules/models'

// Services
import { commonService } from 'src/modules/services'

export const seedTestUsers = async (roles) => {
  const count = await User.countDocuments({})
  if (count > 0) {
    console.log('Test users already seeded. Skipping seeding.')
    return
  }

  const users = await User.insertMany([
    {
      email: 'admin@wizardcld.com',
      first_name: 'Admin',
      last_name: 'User',
      password: commonService.generateHashPassword('123456aA@'),
      roles: map(
        filter(roles, (r) => ['admin', 'user'].includes(r.name)),
        'id'
      ),
      status: 'active'
    },
    {
      email: 'developer@test.com',
      first_name: 'Developer',
      last_name: 'User',
      password: commonService.generateHashPassword('123456aA@'),
      roles: map(
        filter(roles, (r) => ['developer', 'user'].includes(r.name)),
        'id'
      ),
      status: 'active'
    },
    {
      email: 'moderator@test.com',
      first_name: 'Moderator',
      last_name: 'User',
      password: commonService.generateHashPassword('123456aA@'),
      roles: map(
        filter(roles, (r) => ['moderator', 'user'].includes(r.name)),
        'id'
      ),
      status: 'active'
    },
    {
      email: 'user@test.com',
      first_name: 'Test',
      last_name: 'User',
      password: commonService.generateHashPassword('123456aA@'),
      roles: map(
        filter(roles, (r) => ['user'].includes(r.name)),
        'id'
      ),
      status: 'active'
    }
  ])

  return users
}

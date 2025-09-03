import { map } from 'lodash'

// Models
import { User } from 'src/modules/models'

// Services
import { commonService } from 'src/modules/services'

export const seedTestUsers = async (roles) => {
  const users = await User.insertMany([
    {
      email: 'test@user.com',
      first_name: 'Test',
      last_name: 'User',
      password: commonService.generateHashPassword('123456aA@'),
      roles: map(roles, 'id'),
      status: 'active'
    }
  ])

  return users
}

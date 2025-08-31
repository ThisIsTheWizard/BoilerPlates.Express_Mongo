// Models
import { Role, RoleUser, User } from 'src/modules/models'

// Services
import { commonService } from 'src/modules/services'

export const seedTestUsers = async (roles) => {
  const users = await User.insertMany([
    {
      email: 'test@user.com',
      first_name: 'Test',
      last_name: 'User',
      password: commonService.generateHashPassword('123456aA@'),
      status: 'active'
    }
  ])

  const role_users = []
  // const users = await User.findAll({}) // Have to find users from database as bulk create does not give the old ids
  for (const user of users) {
    for (const role of roles) {
      role_users.push({ role_id: role?.id, user_id: user?.id })
    }
  }

  await RoleUser.insertMany(role_users)
  console.log(await User.find({}), await RoleUser.find({}), await Role.find({}))
  return users
}

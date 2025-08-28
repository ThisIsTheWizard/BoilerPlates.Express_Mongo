import { pick } from 'lodash'
import { parse } from 'qs'

// Helpers
import { commonHelper, roleUserHelper } from 'src/modules/helpers'

// Services
import { roleUserService } from 'src/modules/services'

// Utils
import { useSession } from 'src/utils/database'

export const roleUserController = {}

roleUserController.createARoleUser = async (req, res, next) => {
  try {
    const data = await useSession(async (session) => roleUserService.createARoleUserForMutation(req.body, session))

    res.status(201).json({ data, message: 'SUCCESS' })
  } catch (error) {
    next(error)
  }
}

roleUserController.updateARoleUser = async (req, res, next) => {
  try {
    const data = await useSession(async (session) =>
      roleUserService.updateARoleUserForMutation({ entity_id: req.params.entity_id, data: req.body }, session)
    )

    res.status(200).json({ data, message: 'SUCCESS' })
  } catch (error) {
    next(error)
  }
}

roleUserController.deleteARoleUser = async (req, res, next) => {
  try {
    const data = await useSession(async (session) => roleUserService.deleteARoleUserForMutation(req.params, session))

    res.status(200).json({ data, message: 'SUCCESS' })
  } catch (error) {
    next(error)
  }
}

roleUserController.getRoleUsers = async (req, res, next) => {
  try {
    const query = parse(req.query)
    const options = commonHelper.getOptionsFromQuery(query)
    const data = await roleUserHelper.getRoleUsersForQuery(
      pick(query, ['exclude_entity_ids', 'include_entity_ids', 'role_id', 'user_id']),
      options,
      req.user
    )

    res.status(200).json({ data, message: 'SUCCESS' })
  } catch (error) {
    next(error)
  }
}

roleUserController.getARoleUser = async (req, res, next) => {
  try {
    const data = await roleUserHelper.getARoleUserForQuery(req.params, req.user)

    res.status(200).json({ data, message: 'SUCCESS' })
  } catch (error) {
    next(error)
  }
}

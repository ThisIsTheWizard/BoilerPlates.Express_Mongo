import { pick } from 'lodash'
import { parse } from 'qs'

// Helpers
import { commonHelper, rolePermissionHelper } from 'src/modules/helpers'

// Services
import { rolePermissionService } from 'src/modules/services'

// Utils
import { useSession } from 'src/utils/database'

export const rolePermissionController = {}

rolePermissionController.createARolePermission = async (req, res, next) => {
  try {
    const data = await useSession(async (session) =>
      rolePermissionService.createARolePermissionForMutation(req.body, req.user, session)
    )

    res.status(201).json({ data, message: 'SUCCESS' })
  } catch (error) {
    next(error)
  }
}

rolePermissionController.updateARolePermission = async (req, res, next) => {
  try {
    const data = await useSession(async (session) =>
      rolePermissionService.updateARolePermissionForMutation({ ...req.body, ...req.params }, req.user, session)
    )

    res.status(200).json({ data, message: 'SUCCESS' })
  } catch (error) {
    next(error)
  }
}

rolePermissionController.deleteARolePermission = async (req, res, next) => {
  try {
    const data = await useSession(async (session) =>
      rolePermissionService.deleteARolePermissionForMutation(req.params, session)
    )

    res.status(200).json({ data, message: 'SUCCESS' })
  } catch (error) {
    next(error)
  }
}

rolePermissionController.getRolePermissions = async (req, res, next) => {
  try {
    const query = parse(req.query)
    const options = commonHelper.getOptionsFromQuery(query)
    const data = await rolePermissionHelper.getRolePermissionsForQuery(
      pick(query, ['can_do_the_action', 'exclude_entity_ids', 'include_entity_ids', 'permission_id', 'role_id']),
      options,
      req.user
    )

    res.status(200).json({ data, message: 'SUCCESS' })
  } catch (error) {
    next(error)
  }
}

rolePermissionController.getARolePermission = async (req, res, next) => {
  try {
    const data = await rolePermissionHelper.getARolePermissionForQuery(req.params, req.user)

    res.status(200).json({ data, message: 'SUCCESS' })
  } catch (error) {
    next(error)
  }
}

import { pick } from 'lodash'
import { parse } from 'qs'

// Helpers
import { commonHelper, roleHelper } from 'src/modules/helpers'

// Services
import { roleService } from 'src/modules/services'

// Utils
import { useSession } from 'src/utils/database'

export const roleController = {}

roleController.createARole = async (req, res, next) => {
  try {
    const data = await useSession(async (session) => roleService.createARoleForMutation(req.body, req.user, session))

    res.status(201).json({ data, message: 'SUCCESS' })
  } catch (error) {
    next(error)
  }
}

roleController.updateARole = async (req, res, next) => {
  try {
    const data = await useSession(async (session) =>
      roleService.updateARoleForMutation({ collection_id: req.params.collection_id, data: req.body }, session)
    )

    res.status(200).json({ data, message: 'SUCCESS' })
  } catch (error) {
    next(error)
  }
}

roleController.updateRolePermissions = async (req, res, next) => {
  try {
    const data = await useSession(async (session) =>
      roleService.updateRolePermissions({ collection_id: req.params.collection_id, data: req.body }, req.user, session)
    )
    res.status(200).json({ data, message: 'SUCCESS' })
  } catch (error) {
    next(error)
  }
}

roleController.deleteARole = async (req, res, next) => {
  try {
    const data = await useSession(async (session) => roleService.deleteARoleForMutation(req.params, session))

    res.status(200).json({ data, message: 'SUCCESS' })
  } catch (error) {
    next(error)
  }
}

roleController.getRoles = async (req, res, next) => {
  try {
    const query = parse(req.query)
    const options = commonHelper.getOptionsFromQuery(query)
    const data = await roleHelper.getRolesForQuery(
      pick(query, ['exclude_collection_ids', 'include_collection_ids', 'name']),
      options,
      req.user
    )

    res.status(200).json({ data, message: 'SUCCESS' })
  } catch (error) {
    next(error)
  }
}

roleController.getARole = async (req, res, next) => {
  try {
    const data = await roleHelper.getARoleForQuery(req.params, req.user)

    res.status(200).json({ data, message: 'SUCCESS' })
  } catch (error) {
    next(error)
  }
}

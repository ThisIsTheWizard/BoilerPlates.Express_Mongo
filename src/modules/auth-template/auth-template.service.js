import { head } from 'lodash'

// Models
import { AuthTemplate } from 'src/modules/models'

// Helpers
import { authTemplateHelper } from 'src/modules/helpers'

// Utils
import { CustomError } from 'src/utils/error'

export const createAnAuthTemplate = async (data, options, session) => {
  const authTemplates = await AuthTemplate.create([data], { session })

  return head(authTemplates)
}

export const updateAnAuthTemplate = async (options, data, session) => {
  const authTemplate = await authTemplateHelper.getAnAuthTemplate(options, session)
  if (!authTemplate?._id) throw new CustomError(404, 'AUTH_TEMPLATE_NOT_FOUND')

  authTemplate.set(data)
  await authTemplate.save({ session })

  return authTemplate
}

export const deleteAnAuthTemplate = async (options, session) => {
  const authTemplate = await authTemplateHelper.getAnAuthTemplate(options, session)
  if (!authTemplate?._id) {
    throw new CustomError(404, 'AUTH_TEMPLATE_NOT_FOUND')
  }

  await authTemplate.deleteOne({ session })

  return authTemplate
}

export const createAnAuthTemplateForMutation = async (params, user, session) => {
  const { body, event, subject, title } = params || {}

  const authTemplate = await createAnAuthTemplate({ body, event, subject, title }, null, session)
  if (!authTemplate?._id) {
    throw new CustomError(500, 'COULD_NOT_CREATE_AUTH_TEMPLATE')
  }

  return authTemplate
}

export const updateAnAuthTemplateForMutation = async (params, user, session) => {
  const { queryData, inputData } = params || {}
  const { body, event, subject, title } = inputData || {}

  const authTemplate = await authTemplateHelper.getAnAuthTemplate(
    { where: { _id: queryData?.entity_id || null } },
    session
  )
  if (!authTemplate?._id) throw new CustomError(404, 'AUTH_TEMPLATE_NOT_FOUND')

  const updateData = {}
  if (body) updateData.body = body
  if (event) updateData.event = event
  if (subject) updateData.subject = subject
  if (title) updateData.title = title

  Object.assign(authTemplate, updateData)
  await authTemplate.save({ session })

  return authTemplate
}

export const removeAnAuthTemplateForMutation = async (query, user, session) => {
  const authTemplate = await authTemplateHelper.getAnAuthTemplate({
    where: { _id: query?.entity_id }
  })
  if (!authTemplate?._id) throw new CustomError(404, 'AUTH_TEMPLATE_NOT_FOUND')

  await authTemplate.deleteOne({ session })

  return authTemplate
}

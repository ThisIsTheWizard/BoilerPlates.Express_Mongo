import { size } from 'lodash'

// Models
import { AuthTemplate } from 'src/modules/models'

// Utils
import { CustomError } from 'src/utils/error'

export const createAnAuthTemplate = async (data, session) => {
  const [authTemplate] = await AuthTemplate.create([data], { session })
  return authTemplate
}

export const updateAnAuthTemplate = async (options, data, session) => {
  const { query, skip, sort } = options || {}

  const authTemplate = await AuthTemplate.findOneAndUpdate(query, data, { new: true, skip, sort }).session(session)
  if (!authTemplate?._id) {
    throw new CustomError(404, 'AUTH_TEMPLATE_NOT_FOUND')
  }

  return authTemplate
}

export const deleteAnAuthTemplate = async (options, session) => {
  const { query, skip, sort } = options || {}

  const authTemplate = await AuthTemplate.findOneAndDelete(query, { skip, sort }).session(session)
  if (!authTemplate?._id) {
    throw new CustomError(404, 'AUTH_TEMPLATE_NOT_FOUND')
  }

  return authTemplate
}

export const createAnAuthTemplateForMutation = async (params, user, session) => {
  const { body, event, subject, title } = params || {}

  const authTemplate = await createAnAuthTemplate({ body, event, subject, title }, session)
  if (!authTemplate?._id) {
    throw new CustomError(500, 'COULD_NOT_CREATE_AUTH_TEMPLATE')
  }

  return authTemplate
}

export const updateAnAuthTemplateForMutation = async (params, user, session) => {
  const { queryData, inputData } = params || {}
  const { body, event, subject, title } = inputData || {}

  const updatingData = {}
  if (body) updatingData.body = body
  if (event) updatingData.event = event
  if (subject) updatingData.subject = subject
  if (title) updatingData.title = title

  if (!size(updatingData)) {
    throw new CustomError(400, 'NO_DATA_TO_UPDATE')
  }

  return updateAnAuthTemplate({ query: { _id: queryData?.collection_id } }, updatingData, session)
}

export const deleteAnAuthTemplateForMutation = async (query, user, session) =>
  deleteAnAuthTemplate({ query: { _id: query?.collection_id } }, session)

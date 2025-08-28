import { AuthTemplate } from 'src/modules/models'

// Helpers
import {} from 'src/modules/helpers'

// Utils
import { CustomError } from 'src/utils/error'

export const getAnAuthTemplate = async (options, session) => AuthTemplate.findOne(options.where).session(session)

export const getAuthTemplates = async (options, session) => AuthTemplate.find(options.where).session(session)

export const countAuthTemplates = async (options) => AuthTemplate.countDocuments(options.where)

export const prepareAuthTemplateQuery = (params = {}) => {
  const query = {}

  if (params?.entity_id) query._id = params.entity_id
  if (params?.event) query.event = params.event
  if (params?.search_keyword) {
    const searchPattern = { $regex: params.search_keyword, $options: 'i' }
    query.$or = [
      { body: searchPattern },
      { event: searchPattern },
      { subject: searchPattern },
      { title: searchPattern }
    ]
  }
  if (params?.subject) query.subject = { $regex: params.subject, $options: 'i' }
  if (params?.title) query.title = { $regex: params.title, $options: 'i' }

  return query
}

export const getAnAuthTemplateForQuery = async (params) => {
  const query = prepareAuthTemplateQuery(params)
  const authTemplate = await getAnAuthTemplate({ where: query })
  if (!authTemplate?._id) throw new CustomError(404, 'AUTH_TEMPLATE_NOT_FOUND')

  return authTemplate
}

export const getAuthTemplatesForQuery = async (params) => {
  const { options = {}, query = {} } = params || {}
  const { limit, skip, sort } = options || {}

  const where = prepareAuthTemplateQuery(query)
  const authTemplates = await getAuthTemplates({
    limit,
    skip,
    sort,
    where
  })
  const filtered_rows = await countAuthTemplates({ where })
  const total_rows = await countAuthTemplates({ where: {} })

  return { data: authTemplates, meta_data: { filtered_rows, total_rows } }
}

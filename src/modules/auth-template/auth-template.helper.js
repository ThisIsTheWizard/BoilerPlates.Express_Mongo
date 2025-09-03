import { size } from 'lodash'

// Models
import { AuthTemplate } from 'src/modules/models'

// Utils
import { CustomError } from 'src/utils/error'

export const countAuthTemplates = async (query) => AuthTemplate.countDocuments(query)

export const getAnAuthTemplate = async (options, session) => {
  const { populate, query, select, skip, sort } = options || {}

  return AuthTemplate.findOne(query, select, { populate, skip, sort }).session(session)
}

export const getAuthTemplates = async (options, session) => {
  const { limit, populate, query, select, skip, sort } = options || {}

  return AuthTemplate.find(query, select, { limit, populate, skip, sort }).session(session)
}

export const prepareAuthTemplateQuery = (params = {}) => {
  const query = {}

  if (params?.event) query.event = params.event
  if (size(params?.exclude_collection_ids) || size(params?.include_collection_ids)) {
    query._id = {
      $and: [
        ...(size(params?.exclude_collection_ids) ? [{ $nin: params?.exclude_collection_ids }] : []),
        ...(size(params?.include_collection_ids) ? [{ $in: params?.include_collection_ids }] : [])
      ]
    }
  }
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
  const authTemplate = await getAnAuthTemplate({ query: { _id: params?.collection_id } })
  if (!authTemplate?._id) {
    throw new CustomError(404, 'AUTH_TEMPLATE_NOT_FOUND')
  }

  return authTemplate
}

export const getAuthTemplatesForQuery = async (params) => {
  const { limit, skip, sort } = params?.options || {}

  const query = prepareAuthTemplateQuery(params?.query || {})
  const data = await getAuthTemplates({
    limit,
    skip,
    sort,
    query
  })
  const filtered_rows = await countAuthTemplates(query)
  const total_rows = await countAuthTemplates({})

  return { data, meta_data: { filtered_rows, total_rows } }
}

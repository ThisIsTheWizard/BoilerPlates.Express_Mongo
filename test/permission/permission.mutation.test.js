import { api, authToken, expect } from 'test/setup'

describe('Permission Mutation Tests', () => {
  const authorizedConfig = () => ({ headers: { Authorization: authToken } })

  describe('POST /permissions', () => {
    let createdPermissionId

    it('creates a permission successfully', async () => {
      const response = await api.post(
        '/permissions',
        { action: 'create', module: 'permission' },
        authorizedConfig()
      )

      expect(response.status).to.equal(201)
      expect(response.data.data).to.include({ action: 'create', module: 'permission' })
      createdPermissionId = response.data.data._id
      expect(createdPermissionId).to.be.a('string')
    })

    it('returns 401 when authorization token is missing', async () => {
      let error

      try {
        await api.post('/permissions', { action: 'read', module: 'user' })
      } catch (err) {
        error = err
      }

      expect(error?.response?.status).to.equal(401)
      expect(error?.response?.data?.message).to.equal('MISSING_TOKEN')
    })
  })

  describe('PUT /permissions/:collection_id', () => {
    let permissionId

    before(async () => {
      const createResponse = await api.post(
        '/permissions',
        { action: 'read', module: 'role' },
        authorizedConfig()
      )
      permissionId = createResponse.data.data._id
    })

    it('updates a permission successfully', async () => {
      const response = await api.put(
        `/permissions/${permissionId}`,
        { action: 'update' },
        authorizedConfig()
      )

      expect(response.status).to.equal(200)
      expect(response.data.data.action).to.equal('update')
      expect(response.data.data.module).to.equal('role')
    })

    it('returns 400 when update payload is empty', async () => {
      let error

      try {
        await api.put(`/permissions/${permissionId}`, {}, authorizedConfig())
      } catch (err) {
        error = err
      }

      expect(error?.response?.status).to.equal(400)
      expect(error?.response?.data?.message).to.equal('NO_DATA_TO_UPDATE')
    })
  })

  describe('DELETE /permissions/:collection_id', () => {
    let permissionId

    before(async () => {
      const createResponse = await api.post(
        '/permissions',
        { action: 'delete', module: 'user' },
        authorizedConfig()
      )
      permissionId = createResponse.data.data._id
    })

    it('deletes a permission successfully', async () => {
      const response = await api.delete(`/permissions/${permissionId}`, authorizedConfig())

      expect(response.status).to.equal(200)
      expect(response.data.data._id).to.equal(permissionId)
    })

    it('returns 404 when permission does not exist', async () => {
      let error

      try {
        await api.delete(`/permissions/${permissionId}`, authorizedConfig())
      } catch (err) {
        error = err
      }

      expect(error?.response?.status).to.equal(404)
      expect(error?.response?.data?.message).to.equal('PERMISSION_NOT_FOUND')
    })
  })
})

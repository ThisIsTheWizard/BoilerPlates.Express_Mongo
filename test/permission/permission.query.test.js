import { api, authToken, expect } from 'test/setup'

describe('Permission Query Tests', () => {
  let permissionId

  before(async () => {
    const createResponse = await api.post(
      '/permissions',
      { action: 'read', module: 'permission' },
      { headers: { Authorization: authToken } }
    )
    permissionId = createResponse.data.data._id
  })

  describe('GET /permissions', () => {
    it('returns a list of permissions for authorized user', async () => {
      const response = await api.get('/permissions', { headers: { Authorization: authToken } })

      expect(response.status).to.equal(200)
      expect(response.data.data).to.be.an('object')
      expect(response.data.data.data).to.be.an('array')
      expect(response.data.data.data.length).to.be.greaterThan(0)
    })

    it('returns 401 when token is missing', async () => {
      let error

      try {
        await api.get('/permissions')
      } catch (err) {
        error = err
      }

      expect(error?.response?.status).to.equal(401)
      expect(error?.response?.data?.message).to.equal('MISSING_TOKEN')
    })
  })

  describe('GET /permissions/:collection_id', () => {
    it('returns a single permission when it exists', async () => {
      const response = await api.get(`/permissions/${permissionId}`, { headers: { Authorization: authToken } })

      expect(response.status).to.equal(200)
      expect(response.data.data).to.include({ _id: permissionId })
    })

    it('returns 404 for non-existent permission', async () => {
      let error

      try {
        await api.get('/permissions/non-existent-permission', {
          headers: { Authorization: authToken }
        })
      } catch (err) {
        error = err
      }

      expect(error?.response?.status).to.equal(404)
      expect(error?.response?.data?.message).to.equal('PERMISSION_NOT_FOUND')
    })
  })
})

import { api, authToken, expect } from 'test/setup'

describe('Role Query Tests', () => {
  const authorizedConfig = () => ({ headers: { Authorization: authToken } })
  let adminRoleId

  before(async () => {
    const response = await api.get('/roles', {
      ...authorizedConfig(),
      params: { names: ['admin'] }
    })
    adminRoleId = response?.data?.data?.data?.[0]?._id
    expect(adminRoleId).to.be.a('string')
  })

  describe('GET /roles', () => {
    it('returns roles for authorized user', async () => {
      const response = await api.get('/roles', authorizedConfig())

      expect(response.status).to.equal(200)
      expect(response.data.data.data).to.be.an('array')
      expect(response.data.data.meta_data).to.have.keys(['filtered_rows', 'total_rows'])
    })

    it('returns 401 when token is missing', async () => {
      let error

      try {
        await api.get('/roles')
      } catch (err) {
        error = err
      }

      expect(error?.response?.status).to.equal(401)
      expect(error?.response?.data?.message).to.equal('MISSING_TOKEN')
    })
  })

  describe('GET /roles/:collection_id', () => {
    it('returns a single role when it exists', async () => {
      const response = await api.get(`/roles/${adminRoleId}`, authorizedConfig())

      expect(response.status).to.equal(200)
      expect(response.data.data._id).to.equal(adminRoleId)
      expect(response.data.data.name).to.equal('admin')
    })

    it('returns 404 when role does not exist', async () => {
      let error

      try {
        await api.get('/roles/non-existent-role', authorizedConfig())
      } catch (err) {
        error = err
      }

      expect(error?.response?.status).to.equal(404)
      expect(error?.response?.data?.message).to.equal('ROLE_NOT_FOUND')
    })
  })
})

import { api, authToken, expect } from 'test/setup'

describe('Role Mutation Tests', () => {
  const authorizedConfig = () => ({ headers: { Authorization: authToken } })
  const testRoleName = 'moderator'
  const updatedRoleName = testRoleName

  let createdRoleId
  let adminRoleId
  let shouldRestoreModerator = false

  before(async () => {
    const adminResponse = await api.get('/roles', {
      headers: { Authorization: authToken },
      params: { names: ['admin'] }
    })
    adminRoleId = adminResponse?.data?.data?.data?.[0]?._id
    expect(adminRoleId).to.be.a('string')

    const moderatorResponse = await api.get('/roles', {
      headers: { Authorization: authToken },
      params: { names: ['moderator'] }
    })
    const existingModerator = moderatorResponse?.data?.data?.data?.[0]
    if (existingModerator) {
      shouldRestoreModerator = true
      await api.delete(`/roles/${existingModerator._id}`, authorizedConfig())
    }

  })

  after(async () => {
    if (shouldRestoreModerator) {
      await api.post('/roles', { name: 'moderator' }, authorizedConfig())
    }
  })

  describe('POST /roles', () => {
    it('creates a role successfully', async () => {
      const response = await api.post('/roles', { name: testRoleName }, authorizedConfig())

      expect(response.status).to.equal(201)
      createdRoleId = response.data.data._id
      expect(response.data.data.name).to.equal(testRoleName)
    })

    it('returns 401 when authorization token is missing', async () => {
      let error

      try {
        await api.post('/roles', { name: 'user' })
      } catch (err) {
        error = err
      }

      expect(error?.response?.status).to.equal(401)
      expect(error?.response?.data?.message).to.equal('MISSING_TOKEN')
    })
  })

  describe('PUT /roles/:collection_id', () => {
    it('updates a role successfully', async () => {
      const response = await api.put(
        `/roles/${createdRoleId}`,
        { name: updatedRoleName },
        authorizedConfig()
      )

      expect(response.status).to.equal(200)
      expect(response.data.data.name).to.equal(updatedRoleName)
    })

    it('returns 400 when update payload is empty', async () => {
      let error

      try {
        await api.put(`/roles/${createdRoleId}`, {}, authorizedConfig())
      } catch (err) {
        error = err
      }

      expect(error?.response?.status).to.equal(400)
      expect(error?.response?.data?.message).to.equal('NO_DATA_TO_UPDATE')
    })
  })

  describe('PUT /roles/:collection_id/permissions', () => {
    let permissionId

    before(async () => {
      const permissionResponse = await api.post(
        '/permissions',
        { action: 'read', module: 'role_permission' },
        authorizedConfig()
      )
      permissionId = permissionResponse.data.data._id
    })

    it('updates role permissions successfully', async () => {
      const response = await api.put(
        `/roles/${adminRoleId}/permissions`,
        { can_do_the_action: true, permission_id: permissionId },
        authorizedConfig()
      )

      expect(response.status).to.equal(200)
      expect(response.data.data.permissions.some((perm) => perm.permission === permissionId)).to.be.true
    })

    it('returns 404 when role is not found', async () => {
      let error

      try {
        await api.put(
          '/roles/non-existent-role/permissions',
          { can_do_the_action: true, permission_id: permissionId },
          authorizedConfig()
        )
      } catch (err) {
        error = err
      }

      expect(error?.response?.status).to.equal(404)
      expect(error?.response?.data?.message).to.equal('ROLE_NOT_FOUND')
    })
  })

  describe('DELETE /roles/:collection_id', () => {
    it('deletes a role successfully', async () => {
      const response = await api.delete(`/roles/${createdRoleId}`, authorizedConfig())

      expect(response.status).to.equal(200)
      expect(response.data.data._id).to.equal(createdRoleId)
    })

    it('returns 404 when role does not exist', async () => {
      let error

      try {
        await api.delete(`/roles/${createdRoleId}`, authorizedConfig())
      } catch (err) {
        error = err
      }

      expect(error?.response?.status).to.equal(404)
      expect(error?.response?.data?.message).to.equal('ROLE_NOT_FOUND')
    })
  })
})

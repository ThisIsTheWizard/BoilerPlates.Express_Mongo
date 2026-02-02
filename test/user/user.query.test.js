import { api, expect, loginAndGetTokens } from 'test/setup'

describe('User Query Tests', () => {
  describe('GET /users/me', () => {
    it('returns authenticated user details', async () => {
      const tokens = await loginAndGetTokens({ email: 'user@wizardcld.com', password: '123456aA@' })
      const response = await api.get('/users/me', { headers: { Authorization: tokens.access_token } })

      expect(response.status).to.equal(200)
      expect(response.data.data).to.include({ email: 'user@wizardcld.com' })
    })

    it('returns 401 when token is invalid', async () => {
      let error

      try {
        await api.get('/users/me', { headers: { Authorization: 'invalid-token' } })
      } catch (err) {
        error = err
      }

      expect(error?.response?.status).to.equal(401)
      expect(error?.response?.data?.message).to.equal('INVALID_TOKEN')
    })

    it('returns 401 when token is missing', async () => {
      let error

      try {
        await api.get('/users/me')
      } catch (err) {
        error = err
      }

      expect(error?.response?.status).to.equal(401)
      expect(error?.response?.data?.message).to.equal('MISSING_TOKEN')
    })
  })
})

import axios from 'axios'
import { expect } from 'chai'

const api = axios.create({
  baseURL: `http://node_server_test:${process.env.PORT || 8000}`,
  timeout: 120000
})

const loginAndGetTokens = async ({ email, password }) => {
  const response = await api.post('/users/login', { email, password })
  return response?.data?.data
}

let authToken = null
before(async function () {
  await api.post('/test/setup')

  const tokens = await loginAndGetTokens({ email: 'test@user.com', password: '123456aA@' })
  authToken = loginResponse?.access_token
})

export { api, authToken, expect, loginAndGetTokens }

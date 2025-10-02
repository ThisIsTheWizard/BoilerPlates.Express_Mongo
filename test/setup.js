import axios from 'axios'
import { expect } from 'chai'

const api = axios.create({
  baseURL: `http://localhost:${process.env.PORT || 8000}`,
  timeout: 10000
})

let authToken = null
before(async function () {
  try {
    console.log('Before hook called in', import.meta.url, 'at', new Date().toISOString())

    await api.post('/test/setup', undefined, { timeout: 30000 })
    const loginResponse = await api.post('/users/login', {
      email: 'test@user.com',
      password: '123456aA@'
    })
    authToken = loginResponse?.data?.data?.access_token
  } catch (error) {
    console.error('Error in before hook:', error)
    throw error
  }
})

const loginAndGetTokens = async ({ email, password }) => {
  const response = await api.post('/users/login', { email, password })
  return response?.data?.data
}

export { api, authToken, expect, loginAndGetTokens }

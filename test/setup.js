import axios from 'axios'
import { expect } from 'chai'

const api = axios.create({
  baseURL: `http://localhost:${process.env.PORT || 8000}`,
  timeout: 10000
})

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const waitForServer = async ({ attempts = 10, delayMs = 1000 } = {}) => {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await api.get('/', { timeout: 2000 })
      return
    } catch (error) {
      if (attempt === attempts) {
        throw error
      }

      await wait(delayMs)
    }
  }
}

let authToken = null
before(async function () {
  try {
    console.log('Before hook called in', import.meta.url, 'at', new Date().toISOString())
    await waitForServer()

    await api.post('/test/setup', undefined, { timeout: 30000 })
    const loginResponse = await api.post('/users/login', {
      email: 'test@user.com',
      password: '123456aA@'
    })
    authToken = loginResponse?.data?.data?.access_token
  } catch (error) {
    throw error
  }
})

const loginAndGetTokens = async ({ email, password }) => {
  const response = await api.post('/users/login', { email, password })
  return response?.data?.data
}

export { api, authToken, expect, loginAndGetTokens }

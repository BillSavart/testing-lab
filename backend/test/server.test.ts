import { describe, expect, test } from 'vitest'
import { serverOf } from '../src/server'

// 1. Three-tier architecture
describe('Server Testing', () => {
  // 3. Before, After

  // 2. Integration testing
  test('Given a running server, When receive a GET /ping request, Then it should response with status code 200', async () => {
    // arrange: a running server
    const server = serverOf()

    // act: receive a GET /ping request
    const response = await server.inject({
      method: 'GET',
      url: '/ping'
    })

    // assert: response should be status code 200
    expect(response.statusCode).toBe(200)
  })
})

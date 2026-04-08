import { describe, expect, test, vi } from 'vitest'
import { serverOf } from '../src/server'
import { serverStart } from '../src/server'
import { establishConnection } from '../src/plugins/mongodb'
import { FastifyInstance } from 'fastify'
import { AppConfig } from '../src/types/config'

vi.mock('../src/plugins/mongodb', () => ({
  establishConnection: vi.fn()
}))

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

  test('Given app config and server, When start server, Then it should connect mongodb and listen with config options', async () => {
    // arrange: app config and mock server
    const appConfig: AppConfig = {
      port: 3000,
      host: '127.0.0.1',
      mongoConnectionString: 'mongodb://localhost:27017/todo'
    }
    const server = {
      listen: vi.fn().mockResolvedValue('http://127.0.0.1:3000')
    } as unknown as FastifyInstance

    // act: start server
    const startedServer = await serverStart(appConfig)(server)

    // assert: should connect mongodb and listen with app config options
    expect(establishConnection).toHaveBeenCalledWith(appConfig.mongoConnectionString)
    expect(server.listen).toHaveBeenCalledWith({ port: appConfig.port, host: appConfig.host })
    expect(startedServer).toBe(server)
  })
})

import { describe, expect, test, vi } from 'vitest'
import { serverOf } from '../src/server'
import { serverStart } from '../src/server'
import { establishConnection } from '../src/plugins/mongodb'
import { FastifyInstance } from 'fastify'

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

  test('should connect to mongo and listen with host/port from config', async () => {
    const appConfig = {
      mongoConnectionString: 'mongodb://localhost:27017/todo',
      port: 8080,
      host: '127.0.0.1'
    }

    const server = {
      listen: vi.fn().mockResolvedValue('http://127.0.0.1:8080')
    } as unknown as FastifyInstance

    vi.mocked(establishConnection).mockImplementation(async () => ({} as any))

    const result = await serverStart(appConfig)(server)

    expect(establishConnection).toHaveBeenCalledWith(appConfig.mongoConnectionString)
    expect((server.listen as any)).toHaveBeenCalledWith({
      port: appConfig.port,
      host: appConfig.host
    })
    expect(result).toBe(server)
  })
})

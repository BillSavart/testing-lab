import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from 'vitest'
import { serverOf } from '../src/server'
import * as TodoRepo from '../src/repo/todo'
import { FastifyInstance } from 'fastify'
import { Todo, TodoBody } from '../src/types/todo'
import TodoModel from '../src/models/todo'
import { deleteTodoById, updateTodoById } from '../src/repo/todo'

describe('Todo API Testing', () => {
  let server: FastifyInstance

  beforeAll(async () => {
    server = serverOf()
    await server.ready()
  })

  afterAll(async () => {
    await server.close()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  test('When receive a GET /api/v1/todos request, Then it should response an array of todos', async () => {
    // arrange: mock the repo function to return an array of todos
    const todos: Array<Todo> = [
      {
        id: '1',
        name: 'todo 1',
        description: 'description 1',
        status: false
      },
      {
        id: '2',
        name: 'todo 2',
        description: 'description 2',
        status: true
      }
    ]
    // Mock findAllTodos get all todos from database
    vi.spyOn(TodoRepo, 'findAllTodos').mockImplementation(async () => todos)

    // act: receive a GET /api/v1/todos request
    const response = await server.inject({
      method: 'GET',
      url: '/api/v1/todos'
    })

    // assert: response should be an array of todos
    const result = JSON.parse(response.body)['todos']
    expect(result).toStrictEqual(todos)
  })

  test('Given an empty array return from repo function, When receive a GET /api/v1/todos request, Then it should response an empty array', async () => {
    // arrange: mock the repo function to return an empty array
    vi.spyOn(TodoRepo, 'findAllTodos').mockImplementation(async () => [])

    // act: receive a GET /api/v1/todos request
    const response = await server.inject({
      method: 'GET',
      url: '/api/v1/todos'
    })

    // assert: response should be an empty array
    const todos = JSON.parse(response.body)['todos']
    expect(todos).toStrictEqual([])
  })

  test('Given a valid ID and status, When receive a PUT /api/v1/todos/:id request, Then it should response the updated todo object', async () => {
    // arrange: mock the repo function to return an updated todo object
    const id = '1'
    const status = true
    const updatedTodo: Todo = {
      id,
      name: 'todo 1',
      description: 'description 1',
      status
    }
    vi.spyOn(TodoRepo, 'updateTodoById').mockImplementation(async () => updatedTodo)
    // act: receive a PUT /api/v1/todos/:id request
    const response = await server.inject({
      method: 'PUT',
      url: `/api/v1/todos/${id}`,
      payload: {
        status
      }
    })
    // assert: response should be the updated todo object
    expect(response.statusCode).toBe(200)
    expect(JSON.parse(response.body).todo).toStrictEqual(updatedTodo)
  })

  test('Given an invalid ID, When receive a PUT /api/v1/todos/:id request, Then it should response with status code 404', async () => {
    // arrange: mock the repo function to return null
    const id = '999'
    vi.spyOn(TodoRepo, 'updateTodoById').mockImplementation(async () => null)

    // act: receive a PUT /api/v1/todos/:id request
    const response = await server.inject({
      method: 'PUT',
      url: `/api/v1/todos/${id}`,
      payload: {
        status: false
      }
    })

    // assert: response should with status code 404
    expect(response.statusCode).toBe(404)
    expect(JSON.parse(response.body)).toStrictEqual({ msg: `Not Found Todo:${id}` })
  })

  test('Given a valid ID and status, When receive a PUT /api/v1/todos/:id request, Then it should response with status code 500 when server error occurs', async () => {
    // arrange: mock the repo function to throw an error
    const id = '1'
    const status = true
    vi.spyOn(TodoRepo, 'updateTodoById').mockImplementation(
      async () => { throw new Error('Database Error') }
    )
    
    // act: receive a PUT /api/v1/todos/:id request
    const response = await server.inject({
      method: 'PUT',
      url: `/api/v1/todos/${id}`,
      payload: {
        status
      }
    })

    // assert: response should with status code 500
    expect(response.statusCode).toBe(500)
    expect(response.body).toBe('[Server Error]: Error: Database Error')
  })

  test('Given a valid ID, When receive a DELETE /api/v1/todos/:id request, Then it should response with status code 204', async () => {
    // arrange: mock the repo function to return a successful delete result
    const id = '1'
    vi.spyOn(TodoRepo, 'deleteTodoById').mockImplementation(
      async () => ({ ok: 1, value: null } as Awaited<ReturnType<typeof TodoRepo.deleteTodoById>>)
    )
    
    // act: receive a DELETE /api/v1/todos/:id request
    const response = await server.inject({
      method: 'DELETE',
      url: `/api/v1/todos/${id}`
    })

    // assert: response should with status code 204
    expect(response.statusCode).toBe(204)
  })

  test('Given an invalid ID, When receive a DELETE /api/v1/todos/:id request, Then it should response with status code 404', async () => {
    // arrange: mock the repo function to return a failed delete result
    const id = '999'
    vi.spyOn(TodoRepo, 'deleteTodoById').mockImplementation(
      async () => null as unknown as Awaited<ReturnType<typeof TodoRepo.deleteTodoById>>
    )
    
    // act: receive a DELETE /api/v1/todos/:id request
    const response = await server.inject({
      method: 'DELETE',
      url: `/api/v1/todos/${id}`
    })

    // assert: response should with status code 404
    expect(response.statusCode).toBe(404)
    expect(JSON.parse(response.body)).toStrictEqual({ msg: `Not Found Todo:${id}` })
  })

  test('Given a valid ID, When receive a DELETE /api/v1/todos/:id request, Then it should response with status code 500 when server error occurs', async () => {
    // arrange: mock the repo function to throw an error
    const id = '1'
    vi.spyOn(TodoRepo, 'deleteTodoById').mockImplementation(
      async () => { throw new Error('Database Error') }
    )

    // act: receive a DELETE /api/v1/todos/:id request
    const response = await server.inject({
      method: 'DELETE',
      url: `/api/v1/todos/${id}`
    })

    // assert: response should with status code 500
    expect(response.statusCode).toBe(500)
    expect(response.body).toBe('[Server Error]: Error: Database Error')
  })

  test('Given a valid todo body, When receive a POST /api/v1/todos request, Then it should response with the created todo object', async () => {
    // arrange: mock the repo function to return a created todo object
    const todoBody: TodoBody = {
      name: 'new todo',
      description: 'new description'
    }
    const createdTodo: Todo = {
      id: '1',
      name: todoBody.name,
      description: todoBody.description,
      status: false
    }
    vi.spyOn(TodoRepo, 'createTodo').mockImplementation(async () => createdTodo)

    // act: receive a POST /api/v1/todos request
    const response = await server.inject({
      method: 'POST',
      url: '/api/v1/todos',
      payload: todoBody
    })

    // assert: response should be the created todo object
    expect(response.statusCode).toBe(201)
    expect(JSON.parse(response.body).todo).toStrictEqual(createdTodo)
  })

  test('Given a valid todo body, When receive a POST /api/v1/todos request, Then it should response with status code 500 when server error occurs', async () => {
    // arrange: mock the repo function to throw an error
    const todoBody: TodoBody = {
      name: 'new todo',
      description: 'new description'
    }
    vi.spyOn(TodoRepo, 'createTodo').mockImplementation(
      async () => { throw new Error('Database Error') }
    )

    // act: receive a POST /api/v1/todos request
    const response = await server.inject({
      method: 'POST',
      url: '/api/v1/todos',
      payload: todoBody
    })

    // assert: response should with status code 500
    expect(response.statusCode).toBe(500)
    expect(response.body).toBe('[Server Error]: Error: Database Error')
  })

  test('When receive a GET /api/v1/todos request, Then it should response with status code 500 when server error occurs', async () => {
    // arrange: mock the repo function to throw an error
    vi.spyOn(TodoRepo, 'findAllTodos').mockImplementation(
      async () => { throw new Error('Database Error') }
    )

    // act: receive a GET /api/v1/todos request
    const response = await server.inject({
      method: 'GET',
      url: '/api/v1/todos'
    })

    // assert: response should with status code 500
    expect(response.statusCode).toBe(500)
    expect(response.body).toBe('[Server Error]: Error: Database Error')
  })
})

describe('Todo Repo Testing', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  test('Given a valid ID and update payload, When call updateTodoById, Then it should call findByIdAndUpdate with { new: true } and return updated todo', async () => {
    // arrange: mock model function to return an updated todo
    const id = '1'
    const update: Partial<TodoBody> = { name: 'updated todo name' }
    const updatedTodo = {
      id,
      name: 'updated todo name',
      description: 'description 1',
      status: true
    }
    const updateSpy = vi.spyOn(TodoModel, 'findByIdAndUpdate').mockResolvedValue(updatedTodo as any)

    // act: call updateTodoById
    const result = await updateTodoById(id, update)

    // assert: should call findByIdAndUpdate with expected arguments
    expect(updateSpy).toHaveBeenCalledWith(id, update, { new: true })
    expect(result).toStrictEqual(updatedTodo)
  })

  test('Given a valid ID, When call deleteTodoById, Then it should call findByIdAndDelete and return exec result', async () => {
    // arrange: mock model function and query.exec() return value
    const id = '1'
    const deletedTodo = {
      id,
      name: 'todo 1',
      description: 'description 1',
      status: false
    }
    const exec = vi.fn().mockResolvedValue({ ok: 1, value: deletedTodo })
    const deleteSpy = vi.spyOn(TodoModel, 'findByIdAndDelete').mockReturnValue({ exec } as any)

    // act: call deleteTodoById
    const result = await deleteTodoById(id)

    // assert: should call findByIdAndDelete and return exec result
    expect(deleteSpy).toHaveBeenCalledWith(id)
    expect(exec).toHaveBeenCalledTimes(1)
    expect(result).toStrictEqual({ ok: 1, value: deletedTodo })
  })
})

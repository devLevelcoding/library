/**
 * @jest-environment node
 */
import { POST } from '@/app/api/register/route'
import prismadb from '@/lib/prismadb'

jest.mock('@/lib/prismadb', () => ({
  user: {
    create: jest.fn(),
  },
}))

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
}))

const mockPrisma = prismadb as jest.Mocked<typeof prismadb>

const validBody = {
  first_name: 'Jane',
  last_name: 'Doe',
  email: 'jane@example.com',
  password: 'secret123',
}

function makeRequest(body: object) {
  return new Request('http://localhost/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/register', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 400 when first_name is missing', async () => {
    const { first_name, ...body } = validBody
    const res = await POST(makeRequest(body))
    expect(res.status).toBe(400)
    expect(await res.text()).toBe('First Name is required')
  })

  it('returns 400 when last_name is missing', async () => {
    const { last_name, ...body } = validBody
    const res = await POST(makeRequest(body))
    expect(res.status).toBe(400)
    expect(await res.text()).toBe('Last Name is required')
  })

  it('returns 400 when email is missing', async () => {
    const { email, ...body } = validBody
    const res = await POST(makeRequest(body))
    expect(res.status).toBe(400)
    expect(await res.text()).toBe('Email is required')
  })

  it('returns 400 when password is missing', async () => {
    const { password, ...body } = validBody
    const res = await POST(makeRequest(body))
    expect(res.status).toBe(400)
    expect(await res.text()).toBe('Password is required')
  })

  it('creates user with hashed password and returns 200', async () => {
    ;(mockPrisma.user.create as jest.Mock).mockResolvedValue({ id: 'user-1' })

    const res = await POST(makeRequest(validBody))

    expect(res.status).toBe(200)
    expect(await res.text()).toBe('ok')
    expect(mockPrisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: 'jane@example.com',
          hashedPassword: 'hashed_password',
          role: 'user',
        }),
      })
    )
  })

  it('stores hashed password, not plain text', async () => {
    ;(mockPrisma.user.create as jest.Mock).mockResolvedValue({ id: 'user-1' })

    await POST(makeRequest(validBody))

    const callArg = (mockPrisma.user.create as jest.Mock).mock.calls[0][0]
    expect(callArg.data.hashedPassword).not.toBe(validBody.password)
    expect(callArg.data.hashedPassword).toBe('hashed_password')
  })

  it('returns 500 on database error', async () => {
    ;(mockPrisma.user.create as jest.Mock).mockRejectedValue(new Error('fail'))

    const res = await POST(makeRequest(validBody))

    expect(res.status).toBe(500)
  })
})

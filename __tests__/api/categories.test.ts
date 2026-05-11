/**
 * @jest-environment node
 */
import { POST } from '@/app/api/admin/categories/route'
import prismadb from '@/lib/prismadb'

jest.mock('@/lib/prismadb', () => ({
  category: {
    create: jest.fn(),
  },
}))

const mockPrisma = prismadb as jest.Mocked<typeof prismadb>

const validBody = {
  name: 'T-Shirts',
  description: 'Casual t-shirts for everyone',
  enabled: true,
}

function makeRequest(body: object) {
  return new Request('http://localhost/api/admin/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/admin/categories', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 400 when name is missing', async () => {
    const { name, ...body } = validBody
    const res = await POST(makeRequest(body))
    expect(res.status).toBe(400)
    expect(await res.text()).toBe('Name is required')
  })

  it('returns 400 when description is missing', async () => {
    const { description, ...body } = validBody
    const res = await POST(makeRequest(body))
    expect(res.status).toBe(400)
    expect(await res.text()).toBe('Description is required')
  })

  it('creates the category and returns 200', async () => {
    const created = { id: 'cat-1', ...validBody }
    ;(mockPrisma.category.create as jest.Mock).mockResolvedValue(created)

    const res = await POST(makeRequest(validBody))

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.id).toBe('cat-1')
    expect(mockPrisma.category.create).toHaveBeenCalledTimes(1)
  })

  it('defaults enabled to false when not provided', async () => {
    const { enabled, ...body } = validBody
    const created = { id: 'cat-2', ...body, enabled: false }
    ;(mockPrisma.category.create as jest.Mock).mockResolvedValue(created)

    await POST(makeRequest(body))

    expect(mockPrisma.category.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ enabled: false }),
      })
    )
  })

  it('returns 500 on database error', async () => {
    ;(mockPrisma.category.create as jest.Mock).mockRejectedValue(new Error('fail'))

    const res = await POST(makeRequest(validBody))

    expect(res.status).toBe(500)
    expect(await res.text()).toBe('Internal error')
  })
})

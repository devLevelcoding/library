/**
 * @jest-environment node
 */
import { POST } from '@/app/api/admin/sizes/route'
import prismadb from '@/lib/prismadb'

jest.mock('@/lib/prismadb', () => ({
  size: {
    create: jest.fn(),
  },
}))

const mockPrisma = prismadb as jest.Mocked<typeof prismadb>

const validBody = { name: 'Large', value: 'L', enabled: true }

function makeRequest(body: object) {
  return new Request('http://localhost/api/admin/sizes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/admin/sizes', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 400 when name is missing', async () => {
    const { name, ...body } = validBody
    const res = await POST(makeRequest(body))
    expect(res.status).toBe(400)
    expect(await res.text()).toBe('Name is required')
  })

  it('returns 400 when value is missing', async () => {
    const { value, ...body } = validBody
    const res = await POST(makeRequest(body))
    expect(res.status).toBe(400)
    expect(await res.text()).toBe('Value is required')
  })

  it('creates a size and returns 200', async () => {
    const created = { id: 'size-1', ...validBody }
    ;(mockPrisma.size.create as jest.Mock).mockResolvedValue(created)

    const res = await POST(makeRequest(validBody))

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.id).toBe('size-1')
  })

  it('defaults enabled to false when not provided', async () => {
    const { enabled, ...body } = validBody
    ;(mockPrisma.size.create as jest.Mock).mockResolvedValue({ id: 'size-2', ...body, enabled: false })

    await POST(makeRequest(body))

    expect(mockPrisma.size.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ enabled: false }),
      })
    )
  })

  it('returns 500 on database error', async () => {
    ;(mockPrisma.size.create as jest.Mock).mockRejectedValue(new Error('fail'))

    const res = await POST(makeRequest(validBody))

    expect(res.status).toBe(500)
  })
})

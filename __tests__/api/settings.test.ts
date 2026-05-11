/**
 * @jest-environment node
 */
import { POST } from '@/app/api/admin/settings/route'
import prismadb from '@/lib/prismadb'

jest.mock('@/lib/prismadb', () => ({
  setting: {
    create: jest.fn(),
  },
}))

const mockPrisma = prismadb as jest.Mocked<typeof prismadb>

const validBody = {
  billboardImageUrl: 'https://example.com/banner.jpg',
  billboardTitle: 'Summer Sale',
}

function makeRequest(body: object) {
  return new Request('http://localhost/api/admin/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/admin/settings', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 400 when billboardImageUrl is missing', async () => {
    const { billboardImageUrl, ...body } = validBody
    const res = await POST(makeRequest(body))
    expect(res.status).toBe(400)
    expect(await res.text()).toBe('Billboard Image Url is required')
  })

  it('returns 400 when billboardTitle is missing', async () => {
    const { billboardTitle, ...body } = validBody
    const res = await POST(makeRequest(body))
    expect(res.status).toBe(400)
    expect(await res.text()).toBe('Billboard Title is required')
  })

  it('creates a setting and returns 200', async () => {
    const created = { id: 'setting-1', ...validBody }
    ;(mockPrisma.setting.create as jest.Mock).mockResolvedValue(created)

    const res = await POST(makeRequest(validBody))

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.id).toBe('setting-1')
    expect(mockPrisma.setting.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: validBody })
    )
  })

  it('returns 500 on database error', async () => {
    ;(mockPrisma.setting.create as jest.Mock).mockRejectedValue(new Error('fail'))

    const res = await POST(makeRequest(validBody))

    expect(res.status).toBe(500)
    expect(await res.text()).toBe('Internal error')
  })
})

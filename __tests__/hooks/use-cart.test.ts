/**
 * @jest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react'
import useCart from '@/hooks/use-cart'
import toast from 'react-hot-toast'
import { Product } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
  }
})()
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

const makeProduct = (overrides: Partial<Product> = {}): Product => ({
  id: 'prod-1',
  name: 'Test Product',
  price: new Decimal(29.99),
  categoryId: 'cat-1',
  sizeId: 'size-1',
  isFeatured: false,
  isArchived: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

beforeEach(() => {
  localStorageMock.clear()
  // Reset zustand store between tests
  act(() => {
    useCart.getState().removeAll()
  })
  // Clear mock call counts AFTER setup so setup-triggered calls don't pollute assertions
  jest.clearAllMocks()
})

describe('useCart – addItem', () => {
  it('adds a product to the cart', () => {
    const { result } = renderHook(() => useCart())
    const product = makeProduct()

    act(() => {
      result.current.addItem(product)
    })

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].id).toBe('prod-1')
  })

  it('shows success toast on add', () => {
    const { result } = renderHook(() => useCart())

    act(() => {
      result.current.addItem(makeProduct())
    })

    // addItem calls toast.success, not toast() directly
    expect((toast as any).success).toHaveBeenCalled()
  })

  it('does not add a duplicate product', () => {
    const { result } = renderHook(() => useCart())
    const product = makeProduct()

    act(() => {
      result.current.addItem(product)
      result.current.addItem(product)
    })

    expect(result.current.items).toHaveLength(1)
  })

  it('shows "already in cart" toast on duplicate', () => {
    const { result } = renderHook(() => useCart())
    const product = makeProduct()

    act(() => {
      result.current.addItem(product)
      result.current.addItem(product)
    })

    // First add → toast.success; duplicate add → toast() called directly
    expect((toast as any).success).toHaveBeenCalledTimes(1)
    expect(toast).toHaveBeenCalledTimes(1)
  })

  it('can add multiple different products', () => {
    const { result } = renderHook(() => useCart())

    act(() => {
      result.current.addItem(makeProduct({ id: 'prod-1' }))
      result.current.addItem(makeProduct({ id: 'prod-2' }))
    })

    expect(result.current.items).toHaveLength(2)
  })
})

describe('useCart – removeItem', () => {
  it('removes a product by id', () => {
    const { result } = renderHook(() => useCart())

    act(() => {
      result.current.addItem(makeProduct({ id: 'prod-1' }))
      result.current.removeItem('prod-1')
    })

    expect(result.current.items).toHaveLength(0)
  })

  it('only removes the targeted product', () => {
    const { result } = renderHook(() => useCart())

    act(() => {
      result.current.addItem(makeProduct({ id: 'prod-1' }))
      result.current.addItem(makeProduct({ id: 'prod-2' }))
      result.current.removeItem('prod-1')
    })

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].id).toBe('prod-2')
  })

  it('does nothing when removing a non-existent id', () => {
    const { result } = renderHook(() => useCart())

    act(() => {
      result.current.addItem(makeProduct({ id: 'prod-1' }))
      result.current.removeItem('does-not-exist')
    })

    expect(result.current.items).toHaveLength(1)
  })
})

describe('useCart – removeAll', () => {
  it('clears all items from the cart', () => {
    const { result } = renderHook(() => useCart())

    act(() => {
      result.current.addItem(makeProduct({ id: 'prod-1' }))
      result.current.addItem(makeProduct({ id: 'prod-2' }))
      result.current.removeAll()
    })

    expect(result.current.items).toHaveLength(0)
  })

  it('is idempotent on an already-empty cart', () => {
    const { result } = renderHook(() => useCart())

    act(() => {
      result.current.removeAll()
    })

    expect(result.current.items).toHaveLength(0)
  })
})

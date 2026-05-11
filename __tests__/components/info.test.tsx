/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import Info from '@/components/info'
import useCart from '@/hooks/use-cart'
import { Decimal } from '@prisma/client/runtime/library'

jest.mock('@/hooks/use-cart')

const mockProduct = {
  id: 'prod-1',
  name: 'Slim Jeans',
  price: new Decimal(79.99),
  categoryId: 'cat-1',
  sizeId: 'size-1',
  isFeatured: false,
  isArchived: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  images: [],
  size: {
    id: 'size-1',
    name: 'Medium',
    value: 'M',
    enabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  category: {
    id: 'cat-1',
    name: 'Jeans',
    description: 'Denim jeans',
    enabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
}

function setupCartMock(inCart = false) {
  const addItem = jest.fn()
  const removeItem = jest.fn()
  ;(useCart as unknown as jest.Mock).mockReturnValue({
    items: inCart ? [mockProduct] : [],
    addItem,
    removeItem,
    removeAll: jest.fn(),
  })
  return { addItem, removeItem }
}

describe('Info', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the product name', () => {
    setupCartMock()
    render(<Info data={mockProduct} />)
    expect(screen.getByText('Slim Jeans')).toBeInTheDocument()
  })

  it('renders the formatted price', () => {
    setupCartMock()
    render(<Info data={mockProduct} />)
    expect(screen.getByText('$79.99')).toBeInTheDocument()
  })

  it('renders the size name', () => {
    setupCartMock()
    render(<Info data={mockProduct} />)
    expect(screen.getByText('Medium')).toBeInTheDocument()
  })

  it('shows Add To Cart when product is not in cart', () => {
    setupCartMock(false)
    render(<Info data={mockProduct} />)
    expect(screen.getByText('Add To Cart')).toBeInTheDocument()
  })

  it('shows Remove from cart when product is in cart', () => {
    setupCartMock(true)
    render(<Info data={mockProduct} />)
    expect(screen.getByText('Remove from cart')).toBeInTheDocument()
  })

  it('calls addItem when Add To Cart is clicked', () => {
    const { addItem } = setupCartMock(false)
    render(<Info data={mockProduct} />)
    fireEvent.click(screen.getByText('Add To Cart'))
    expect(addItem).toHaveBeenCalledWith(mockProduct)
  })

  it('calls removeItem when Remove from cart is clicked', () => {
    const { removeItem } = setupCartMock(true)
    render(<Info data={mockProduct} />)
    fireEvent.click(screen.getByText('Remove from cart'))
    expect(removeItem).toHaveBeenCalledWith('prod-1')
  })

  it('does not propagate click events to parent', () => {
    const { addItem } = setupCartMock(false)
    const parentClick = jest.fn()
    render(
      <div onClick={parentClick}>
        <Info data={mockProduct} />
      </div>
    )
    fireEvent.click(screen.getByText('Add To Cart'))
    // addItem called but parent not triggered due to stopPropagation
    expect(addItem).toHaveBeenCalled()
    expect(parentClick).not.toHaveBeenCalled()
  })
})

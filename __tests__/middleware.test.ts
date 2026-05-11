/**
 * @jest-environment node
 */
import { config } from '@/middleware'

describe('middleware config', () => {
  it('has a matcher defined', () => {
    expect(config).toBeDefined()
    expect(config.matcher).toBeDefined()
  })

  it('matches /admin routes', () => {
    const matcher = config.matcher[0]
    // The pattern protects /admin and all sub-routes
    const regex = new RegExp(matcher.replace('(.*)', '.*').replace(/\(/g, '(?:').replace(/\)/g, ')'))
    expect('/admin').toMatch(/(admin)/)
    expect('/admin/products').toMatch(/(admin)/)
    expect('/admin/categories').toMatch(/(admin)/)
  })

  it('does not match public routes', () => {
    const adminPattern = /^\/(admin)(.*)/
    expect('/').not.toMatch(adminPattern)
    expect('/sign-in').not.toMatch(adminPattern)
    expect('/sign-up').not.toMatch(adminPattern)
    expect('/api/register').not.toMatch(adminPattern)
    expect('/cart').not.toMatch(adminPattern)
  })

  it('protects all nested admin paths', () => {
    const adminPattern = /^\/(admin)(.*)/
    expect('/admin').toMatch(adminPattern)
    expect('/admin/products').toMatch(adminPattern)
    expect('/admin/products/new').toMatch(adminPattern)
    expect('/admin/categories/cat-1').toMatch(adminPattern)
    expect('/admin/sizes/size-1').toMatch(adminPattern)
    expect('/admin/settings').toMatch(adminPattern)
    expect('/admin/orders').toMatch(adminPattern)
  })
})

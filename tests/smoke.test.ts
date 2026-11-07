import { describe, expect, it } from 'vitest'
import { formatInTimeZone } from 'date-fns-tz'

describe('smoke', () => {
  it('runs in the nuxt environment', () => {
    expect(formatInTimeZone(new Date('2026-01-01T12:00:00Z'), 'UTC', 'yyyy-MM-dd')).toBe('2026-01-01')
  })
})

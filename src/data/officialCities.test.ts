import { describe, expect, it } from 'vitest'
import { HOME_CITIES, getCityById } from './cities'
import { listOfficialCities } from './catalogue'

describe('official cities', () => {
  it('exposes at least 120 official cities', () => {
    expect(listOfficialCities().length).toBeGreaterThanOrEqual(120)
  })

  it('HOME_CITIES matches official cities', () => {
    expect(HOME_CITIES.length).toBe(listOfficialCities().length)
    expect(getCityById('zagreb')?.name.hr).toBe('Zagreb')
  })
})

import { getPlaceById, listOfficialCities } from './catalogue'

export type City = {
  id: string
  name: { hr: string; en: string }
  lat: number
  lon: number
  /** Matches counties.ts ids */
  countyId: string
}

/** Official RH cities for profile home-city selection. */
export const HOME_CITIES: City[] = listOfficialCities().map((p) => ({
  id: p.id,
  name: p.name,
  lat: p.lat,
  lon: p.lon,
  countyId: p.countyId,
}))

export function getCityById(id: string): City | undefined {
  const p = getPlaceById(id)
  if (!p?.isOfficialCity) return undefined
  return { id: p.id, name: p.name, lat: p.lat, lon: p.lon, countyId: p.countyId }
}

import raw from '../../content/hr/places-catalogue.json'
import type { PlaceRecord } from './placeTypes'

export const PLACE_CATALOGUE = raw as PlaceRecord[]

const byId = new Map(PLACE_CATALOGUE.map((p) => [p.id, p]))
const byPlate = new Map(
  PLACE_CATALOGUE.filter((p) => p.plateCode).map((p) => [p.plateCode!, p]),
)

export function getPlaceById(id: string): PlaceRecord | undefined {
  return byId.get(id)
}

export function listOfficialCities(): PlaceRecord[] {
  return PLACE_CATALOGUE.filter((p) => p.isOfficialCity)
}

export function listPlateSeats(): PlaceRecord[] {
  return PLACE_CATALOGUE.filter((p) => Boolean(p.plateCode))
}

export function getPlaceByPlateCode(code: string): PlaceRecord | undefined {
  return byPlate.get(code)
}

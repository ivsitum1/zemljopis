import { listPlateSeats } from './catalogue'

export type PlateEntry = {
  code: string
  /** County id from counties.ts */
  countyId: string
  city: { hr: string; en: string }
}

/** Civil HR area codes derived from catalogue plate seats (HAK list). */
export const PLATES: PlateEntry[] = listPlateSeats().map((p) => ({
  code: p.plateCode!,
  countyId: p.countyId,
  city: p.name,
}))

export function getPlateByCode(code: string): PlateEntry | undefined {
  return PLATES.find((plate) => plate.code === code)
}

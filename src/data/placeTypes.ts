export type LocalizedText = { hr: string; en: string }

export type PlaceRecord = {
  id: string
  name: LocalizedText
  isOfficialCity: boolean
  plateCode?: string
  countyId: string
  lat: number
  lon: number
  facts: LocalizedText[]
  neighborIds?: string[]
  region?: LocalizedText
  curriculumTags?: string[]
}

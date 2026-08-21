export type MapRegion = 'hr' | 'eu'

export type MapPoint = {
  lat: number
  lon: number
  label?: string
  countyId?: string
  role: 'home' | 'target' | 'secondary'
}

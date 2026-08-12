export type MapRegion = 'hr' | 'eu'

export type MapPoint = {
  lat: number
  lon: number
  label?: string
  role: 'home' | 'target' | 'secondary'
}

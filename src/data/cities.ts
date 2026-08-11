export type City = {
  id: string
  name: { hr: string; en: string }
  lat: number
  lon: number
  countyId: string
}

/** Starter home-city list for profile setup (MVP Croatia). */
export const HOME_CITIES: City[] = [
  { id: 'zagreb', name: { hr: 'Zagreb', en: 'Zagreb' }, lat: 45.815, lon: 15.982, countyId: 'zg' },
  { id: 'split', name: { hr: 'Split', en: 'Split' }, lat: 43.508, lon: 16.44, countyId: 'st' },
  { id: 'rijeka', name: { hr: 'Rijeka', en: 'Rijeka' }, lat: 45.327, lon: 14.442, countyId: 'ri' },
  { id: 'osijek', name: { hr: 'Osijek', en: 'Osijek' }, lat: 45.555, lon: 18.696, countyId: 'os' },
  { id: 'zadar', name: { hr: 'Zadar', en: 'Zadar' }, lat: 44.119, lon: 15.231, countyId: 'zd' },
  { id: 'slavonski-brod', name: { hr: 'Slavonski Brod', en: 'Slavonski Brod' }, lat: 45.16, lon: 18.016, countyId: 'sb' },
  { id: 'pula', name: { hr: 'Pula', en: 'Pula' }, lat: 44.867, lon: 13.85, countyId: 'pu' },
  { id: 'karlovac', name: { hr: 'Karlovac', en: 'Karlovac' }, lat: 45.493, lon: 15.555, countyId: 'ka' },
  { id: 'varazdin', name: { hr: 'Varaždin', en: 'Varaždin' }, lat: 46.306, lon: 16.338, countyId: 'vz' },
  { id: 'sibenik', name: { hr: 'Šibenik', en: 'Šibenik' }, lat: 43.735, lon: 15.895, countyId: 'si' },
  { id: 'dubrovnik', name: { hr: 'Dubrovnik', en: 'Dubrovnik' }, lat: 42.651, lon: 18.094, countyId: 'du' },
  { id: 'sisak', name: { hr: 'Sisak', en: 'Sisak' }, lat: 45.485, lon: 16.373, countyId: 'sk' },
  { id: 'velika-gorica', name: { hr: 'Velika Gorica', en: 'Velika Gorica' }, lat: 45.713, lon: 16.076, countyId: 'zg' },
  { id: 'vinkovci', name: { hr: 'Vinkovci', en: 'Vinkovci' }, lat: 45.288, lon: 18.805, countyId: 'vk' },
  { id: 'bjelovar', name: { hr: 'Bjelovar', en: 'Bjelovar' }, lat: 45.899, lon: 16.843, countyId: 'bj' },
  { id: 'koprivnica', name: { hr: 'Koprivnica', en: 'Koprivnica' }, lat: 46.164, lon: 16.828, countyId: 'kc' },
  { id: 'cakovec', name: { hr: 'Čakovec', en: 'Čakovec' }, lat: 46.385, lon: 16.434, countyId: 'ck' },
  { id: 'pozega', name: { hr: 'Požega', en: 'Požega' }, lat: 45.34, lon: 17.685, countyId: 'pz' },
  { id: 'virovitica', name: { hr: 'Virovitica', en: 'Virovitica' }, lat: 45.832, lon: 17.384, countyId: 'vt' },
  { id: 'gospic', name: { hr: 'Gospić', en: 'Gospić' }, lat: 44.546, lon: 15.375, countyId: 'gs' },
]

export function getCityById(id: string): City | undefined {
  return HOME_CITIES.find((city) => city.id === id)
}

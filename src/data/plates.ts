export type PlateEntry = {
  code: string
  /** County id from counties.ts */
  countyId: string
  city: { hr: string; en: string }
}

/** Croatian vehicle registration area codes (županijska središta + Grad Zagreb). */
export const PLATES: PlateEntry[] = [
  { code: 'ZG', countyId: 'gzg', city: { hr: 'Zagreb', en: 'Zagreb' } },
  { code: 'ST', countyId: 'sdz', city: { hr: 'Split', en: 'Split' } },
  { code: 'RI', countyId: 'pgz', city: { hr: 'Rijeka', en: 'Rijeka' } },
  { code: 'OS', countyId: 'obz', city: { hr: 'Osijek', en: 'Osijek' } },
  { code: 'ZD', countyId: 'zdz', city: { hr: 'Zadar', en: 'Zadar' } },
  { code: 'PU', countyId: 'isz', city: { hr: 'Pula', en: 'Pula' } },
  { code: 'ŠI', countyId: 'szz', city: { hr: 'Šibenik', en: 'Šibenik' } },
  { code: 'DU', countyId: 'dnz', city: { hr: 'Dubrovnik', en: 'Dubrovnik' } },
  { code: 'ČK', countyId: 'mez', city: { hr: 'Čakovec', en: 'Čakovec' } },
  { code: 'VŽ', countyId: 'vaz', city: { hr: 'Varaždin', en: 'Varaždin' } },
  { code: 'KR', countyId: 'kzz2', city: { hr: 'Krapina', en: 'Krapina' } },
  { code: 'KA', countyId: 'kzz', city: { hr: 'Karlovac', en: 'Karlovac' } },
  { code: 'SK', countyId: 'smz', city: { hr: 'Sisak', en: 'Sisak' } },
  { code: 'KC', countyId: 'ksz', city: { hr: 'Koprivnica', en: 'Koprivnica' } },
  { code: 'BJ', countyId: 'bbz', city: { hr: 'Bjelovar', en: 'Bjelovar' } },
  { code: 'VT', countyId: 'vpz', city: { hr: 'Virovitica', en: 'Virovitica' } },
  { code: 'PŽ', countyId: 'psz', city: { hr: 'Požega', en: 'Požega' } },
  { code: 'SB', countyId: 'bpz', city: { hr: 'Slavonski Brod', en: 'Slavonski Brod' } },
  { code: 'VK', countyId: 'vsz', city: { hr: 'Vukovar', en: 'Vukovar' } },
  { code: 'GS', countyId: 'lsz', city: { hr: 'Gospić', en: 'Gospić' } },
]

export function getPlateByCode(code: string): PlateEntry | undefined {
  return PLATES.find((plate) => plate.code === code)
}

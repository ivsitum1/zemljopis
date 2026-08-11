export type LocalizedName = {
  hr: string
  en: string
}

export type County = {
  id: string
  name: LocalizedName
  /** Plate code when unique enough for later modes */
  plateCode?: string
  curriculumTags: string[]
}

/** 21 Croatian counties including City of Zagreb. */
export const COUNTIES: County[] = [
  { id: 'bbz', name: { hr: 'Bjelovarsko-bilogorska', en: 'Bjelovar-Bilogora' }, plateCode: 'BJ', curriculumTags: ['GEO-OS-A.5.4'] },
  { id: 'bpz', name: { hr: 'Brodsko-posavska', en: 'Brod-Posavina' }, plateCode: 'SB', curriculumTags: ['GEO-OS-A.5.4'] },
  { id: 'dnz', name: { hr: 'Dubrovačko-neretvanska', en: 'Dubrovnik-Neretva' }, plateCode: 'DU', curriculumTags: ['GEO-OS-A.5.4'] },
  { id: 'isz', name: { hr: 'Istarska', en: 'Istria' }, plateCode: 'PU', curriculumTags: ['GEO-OS-A.5.4'] },
  { id: 'kzz', name: { hr: 'Karlovačka', en: 'Karlovac' }, plateCode: 'KA', curriculumTags: ['GEO-OS-A.5.4'] },
  { id: 'ksz', name: { hr: 'Koprivničko-križevačka', en: 'Koprivnica-Križevci' }, plateCode: 'KC', curriculumTags: ['GEO-OS-A.5.4'] },
  { id: 'kzz2', name: { hr: 'Krapinsko-zagorska', en: 'Krapina-Zagorje' }, plateCode: 'KR', curriculumTags: ['GEO-OS-A.5.4'] },
  { id: 'lsz', name: { hr: 'Ličko-senjska', en: 'Lika-Senj' }, plateCode: 'GS', curriculumTags: ['GEO-OS-A.5.4'] },
  { id: 'mez', name: { hr: 'Međimurska', en: 'Međimurje' }, plateCode: 'ČK', curriculumTags: ['GEO-OS-A.5.4'] },
  { id: 'obz', name: { hr: 'Osječko-baranjska', en: 'Osijek-Baranja' }, plateCode: 'OS', curriculumTags: ['GEO-OS-A.5.4'] },
  { id: 'psz', name: { hr: 'Požeško-slavonska', en: 'Požega-Slavonia' }, plateCode: 'PŽ', curriculumTags: ['GEO-OS-A.5.4'] },
  { id: 'pgz', name: { hr: 'Primorsko-goranska', en: 'Primorje-Gorski Kotar' }, plateCode: 'RI', curriculumTags: ['GEO-OS-A.5.4'] },
  { id: 'smz', name: { hr: 'Sisačko-moslavačka', en: 'Sisak-Moslavina' }, plateCode: 'SK', curriculumTags: ['GEO-OS-A.5.4'] },
  { id: 'sdz', name: { hr: 'Splitsko-dalmatinska', en: 'Split-Dalmatia' }, plateCode: 'ST', curriculumTags: ['GEO-OS-A.5.4'] },
  { id: 'szz', name: { hr: 'Šibensko-kninska', en: 'Šibenik-Knin' }, plateCode: 'ŠI', curriculumTags: ['GEO-OS-A.5.4'] },
  { id: 'vaz', name: { hr: 'Varaždinska', en: 'Varaždin' }, plateCode: 'VŽ', curriculumTags: ['GEO-OS-A.5.4'] },
  { id: 'vpz', name: { hr: 'Virovitičko-podravska', en: 'Virovitica-Podravina' }, plateCode: 'VT', curriculumTags: ['GEO-OS-A.5.4'] },
  { id: 'vsz', name: { hr: 'Vukovarsko-srijemska', en: 'Vukovar-Srijem' }, plateCode: 'VK', curriculumTags: ['GEO-OS-A.5.4'] },
  { id: 'zdz', name: { hr: 'Zadarska', en: 'Zadar' }, plateCode: 'ZD', curriculumTags: ['GEO-OS-A.5.4'] },
  { id: 'zgz', name: { hr: 'Zagrebačka', en: 'Zagreb County' }, plateCode: 'ZG', curriculumTags: ['GEO-OS-A.5.4'] },
  { id: 'gzg', name: { hr: 'Grad Zagreb', en: 'City of Zagreb' }, plateCode: 'ZG', curriculumTags: ['GEO-OS-A.5.4'] },
]

export function getCountyById(id: string): County | undefined {
  return COUNTIES.find((county) => county.id === id)
}

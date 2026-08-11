export type LocalizedText = { hr: string; en: string }

export type PlaceCard = {
  id: string
  name: LocalizedText
  lat: number
  lon: number
  /** Matches counties.ts ids */
  countyId: string
  region: LocalizedText
  facts: {
    basic: LocalizedText[]
    advanced: LocalizedText[]
  }
  curriculumTags: string[]
  /** true = curated core; false = stub for later enrichment */
  curated: boolean
}

/**
 * Curated core (county seats + major cities) + a few stubs.
 * Facts are short educational notes for practice — not an encyclopedia.
 */
export const PLACES: PlaceCard[] = [
  {
    id: 'zagreb',
    name: { hr: 'Zagreb', en: 'Zagreb' },
    lat: 45.815,
    lon: 15.982,
    countyId: 'gzg',
    region: { hr: 'Središnja Hrvatska', en: 'Central Croatia' },
    curated: true,
    curriculumTags: ['GEO-OS-A.5.4', 'GEO-OS-A.6.1'],
    facts: {
      basic: [
        { hr: 'Glavni grad Hrvatske.', en: 'Capital city of Croatia.' },
        { hr: 'U blizini su Medvednica i rijeka Sava.', en: 'Near Medvednica mountain and the Sava river.' },
        { hr: 'Poznat po Gornjem gradu i katedrali.', en: 'Known for the Upper Town and the cathedral.' },
      ],
      advanced: [
        {
          hr: 'Najveće gospodarsko i prometno središte zemlje.',
          en: 'The country’s largest economic and transport hub.',
        },
        {
          hr: 'Leži na dodiru panonskog i dinarskog prostora.',
          en: 'Lies at the contact of the Pannonian and Dinaric areas.',
        },
      ],
    },
  },
  {
    id: 'split',
    name: { hr: 'Split', en: 'Split' },
    lat: 43.508,
    lon: 16.44,
    countyId: 'sdz',
    region: { hr: 'Dalmacija', en: 'Dalmatia' },
    curated: true,
    curriculumTags: ['GEO-OS-A.5.4'],
    facts: {
      basic: [
        { hr: 'Najveći grad u Dalmaciji.', en: 'The largest city in Dalmatia.' },
        { hr: 'Poznat po Dioklecijanovoj palači.', en: 'Known for Diocletian’s Palace.' },
        { hr: 'Važna luka na Jadranu.', en: 'An important Adriatic port.' },
      ],
      advanced: [
        {
          hr: 'Središte Splitsko-dalmatinske županije i regionalni prometni čvor.',
          en: 'Seat of Split-Dalmatia County and a regional transport node.',
        },
        {
          hr: 'Povezuje kopno s otocima srednje Dalmacije.',
          en: 'Links the mainland with the islands of central Dalmatia.',
        },
      ],
    },
  },
  {
    id: 'rijeka',
    name: { hr: 'Rijeka', en: 'Rijeka' },
    lat: 45.327,
    lon: 14.442,
    countyId: 'pgz',
    region: { hr: 'Sjeverni Jadran', en: 'Northern Adriatic' },
    curated: true,
    curriculumTags: ['GEO-OS-A.5.4'],
    facts: {
      basic: [
        { hr: 'Najveća hrvatska luka.', en: 'Croatia’s largest seaport.' },
        { hr: 'Leži u Kvarnerskom zaljevu.', en: 'Lies on the Kvarner Gulf.' },
        { hr: 'Poznata po Riječkom karnevalu.', en: 'Known for the Rijeka Carnival.' },
      ],
      advanced: [
        {
          hr: 'Ključan izlaz prema Srednjoj Europi (željeznica i ceste).',
          en: 'A key outlet toward Central Europe (rail and roads).',
        },
        {
          hr: 'Središte Primorsko-goranske županije.',
          en: 'Seat of Primorje-Gorski Kotar County.',
        },
      ],
    },
  },
  {
    id: 'osijek',
    name: { hr: 'Osijek', en: 'Osijek' },
    lat: 45.555,
    lon: 18.696,
    countyId: 'obz',
    region: { hr: 'Slavonija', en: 'Slavonia' },
    curated: true,
    curriculumTags: ['GEO-OS-A.5.4'],
    facts: {
      basic: [
        { hr: 'Najveći grad u Slavoniji.', en: 'The largest city in Slavonia.' },
        { hr: 'Leži na rijeci Dravi.', en: 'Lies on the Drava river.' },
        { hr: 'U blizini je Park prirode Kopački rit.', en: 'Near Kopački rit Nature Park.' },
      ],
      advanced: [
        {
          hr: 'Središte Osječko-baranjske županije i panonskog nizinskog prostora.',
          en: 'Seat of Osijek-Baranja County in the Pannonian lowland.',
        },
        {
          hr: 'Važan poljoprivredni i sveučilišni centar istoka Hrvatske.',
          en: 'An important agricultural and university centre of eastern Croatia.',
        },
      ],
    },
  },
  {
    id: 'zadar',
    name: { hr: 'Zadar', en: 'Zadar' },
    lat: 44.119,
    lon: 15.231,
    countyId: 'zdz',
    region: { hr: 'Sjeverna Dalmacija', en: 'Northern Dalmatia' },
    curated: true,
    curriculumTags: ['GEO-OS-A.5.4'],
    facts: {
      basic: [
        { hr: 'Grad na poluotoku uz more.', en: 'A city on a peninsula by the sea.' },
        { hr: 'Poznat po Morskim orguljama.', en: 'Known for the Sea Organ.' },
        { hr: 'U blizini su Nacionalni parkovi Paklenica i Kornati.', en: 'Near Paklenica and Kornati national parks.' },
      ],
      advanced: [
        {
          hr: 'Središte Zadarske županije i luka za otoke sjeverne Dalmacije.',
          en: 'Seat of Zadar County and a ferry hub for northern Dalmatian islands.',
        },
      ],
    },
  },
  {
    id: 'pula',
    name: { hr: 'Pula', en: 'Pula' },
    lat: 44.867,
    lon: 13.85,
    countyId: 'isz',
    region: { hr: 'Istra', en: 'Istria' },
    curated: true,
    curriculumTags: ['GEO-OS-A.5.4'],
    facts: {
      basic: [
        { hr: 'Najveći grad u Istri.', en: 'The largest city in Istria.' },
        { hr: 'Poznata po rimskom amfiteatru (Areni).', en: 'Known for the Roman amphitheatre (Arena).' },
        { hr: 'Važna luka i turističko središte.', en: 'An important port and tourist centre.' },
      ],
      advanced: [
        {
          hr: 'Središte Istarske županije; Istra je poluotok između Kvarnera i Tršćanskog zaljeva.',
          en: 'Seat of Istria County; Istria is a peninsula between Kvarner and the Gulf of Trieste.',
        },
      ],
    },
  },
  {
    id: 'dubrovnik',
    name: { hr: 'Dubrovnik', en: 'Dubrovnik' },
    lat: 42.651,
    lon: 18.094,
    countyId: 'dnz',
    region: { hr: 'Južna Dalmacija', en: 'Southern Dalmatia' },
    curated: true,
    curriculumTags: ['GEO-OS-A.5.4'],
    facts: {
      basic: [
        { hr: 'Poznat po starim zidinama i Starom gradu.', en: 'Known for its walls and Old Town.' },
        { hr: 'Leži na krajnjem jugu hrvatske obale.', en: 'Lies at the far south of the Croatian coast.' },
        { hr: 'Važno turističko odredište.', en: 'A major tourist destination.' },
      ],
      advanced: [
        {
          hr: 'Središte Dubrovačko-neretvanske županije; nekad samostalna Dubrovačka Republika.',
          en: 'Seat of Dubrovnik-Neretva County; formerly the independent Republic of Ragusa.',
        },
      ],
    },
  },
  {
    id: 'sibenik',
    name: { hr: 'Šibenik', en: 'Šibenik' },
    lat: 43.735,
    lon: 15.895,
    countyId: 'szz',
    region: { hr: 'Dalmacija', en: 'Dalmatia' },
    curated: true,
    curriculumTags: ['GEO-OS-A.5.4'],
    facts: {
      basic: [
        { hr: 'Grad na ušću Krke u more.', en: 'A city where the Krka river meets the sea.' },
        { hr: 'Poznat po katedrali sv. Jakova.', en: 'Known for the Cathedral of St James.' },
        { hr: 'U blizini je Nacionalni park Krka.', en: 'Near Krka National Park.' },
      ],
      advanced: [
        {
          hr: 'Središte Šibensko-kninske županije.',
          en: 'Seat of Šibenik-Knin County.',
        },
      ],
    },
  },
  {
    id: 'varazdin',
    name: { hr: 'Varaždin', en: 'Varaždin' },
    lat: 46.306,
    lon: 16.338,
    countyId: 'vaz',
    region: { hr: 'Sjeverozapadna Hrvatska', en: 'Northwestern Croatia' },
    curated: true,
    curriculumTags: ['GEO-OS-A.5.4'],
    facts: {
      basic: [
        { hr: 'Poznat po baroknoj jezgri grada.', en: 'Known for its Baroque city centre.' },
        { hr: 'Leži blizu rijeke Drave.', en: 'Lies near the Drava river.' },
        { hr: 'Često ga zovu „gradom baroka“.', en: 'Often called a “Baroque city”.' },
      ],
      advanced: [
        {
          hr: 'Središte Varaždinske županije u panonskom prostoru.',
          en: 'Seat of Varaždin County in the Pannonian area.',
        },
      ],
    },
  },
  {
    id: 'karlovac',
    name: { hr: 'Karlovac', en: 'Karlovac' },
    lat: 45.493,
    lon: 15.555,
    countyId: 'kzz',
    region: { hr: 'Središnja Hrvatska', en: 'Central Croatia' },
    curated: true,
    curriculumTags: ['GEO-OS-A.5.4'],
    facts: {
      basic: [
        { hr: 'Poznat po četiri rijeke (Kupa, Korana, Mrežnica, Dobra).', en: 'Known for four rivers (Kupa, Korana, Mrežnica, Dobra).' },
        { hr: 'Leži na putu između Zagreba i Jadrana.', en: 'Lies on the route between Zagreb and the Adriatic.' },
      ],
      advanced: [
        {
          hr: 'Središte Karlovačke županije; povijesno važan prometni položaj.',
          en: 'Seat of Karlovac County; historically an important transport position.',
        },
      ],
    },
  },
  {
    id: 'slavonski-brod',
    name: { hr: 'Slavonski Brod', en: 'Slavonski Brod' },
    lat: 45.16,
    lon: 18.016,
    countyId: 'bpz',
    region: { hr: 'Slavonija', en: 'Slavonia' },
    curated: true,
    curriculumTags: ['GEO-OS-A.5.4'],
    facts: {
      basic: [
        { hr: 'Leži na rijeci Savi, nasuprot Bosanskom Brodu.', en: 'Lies on the Sava, opposite Bosanski Brod.' },
        { hr: 'Važan grad uz autocestu prema istoku.', en: 'An important city on the motorway toward the east.' },
      ],
      advanced: [
        {
          hr: 'Središte Brodsko-posavske županije.',
          en: 'Seat of Brod-Posavina County.',
        },
      ],
    },
  },
  {
    id: 'sisak',
    name: { hr: 'Sisak', en: 'Sisak' },
    lat: 45.485,
    lon: 16.373,
    countyId: 'smz',
    region: { hr: 'Središnja Hrvatska', en: 'Central Croatia' },
    curated: true,
    curriculumTags: ['GEO-OS-A.5.4'],
    facts: {
      basic: [
        { hr: 'Leži na ušću Kupe u Savu.', en: 'Lies where the Kupa joins the Sava.' },
        { hr: 'Poznat po industriji i rijekama.', en: 'Known for industry and rivers.' },
      ],
      advanced: [
        {
          hr: 'Središte Sisačko-moslavačke županije.',
          en: 'Seat of Sisak-Moslavina County.',
        },
      ],
    },
  },
  {
    id: 'cakovec',
    name: { hr: 'Čakovec', en: 'Čakovec' },
    lat: 46.385,
    lon: 16.434,
    countyId: 'mez',
    region: { hr: 'Međimurje', en: 'Međimurje' },
    curated: true,
    curriculumTags: ['GEO-OS-A.5.4'],
    facts: {
      basic: [
        { hr: 'Središte Međimurja, između Mure i Drave.', en: 'Centre of Međimurje, between the Mura and Drava.' },
        { hr: 'Poznat po Zrinskih dvorcu.', en: 'Known for the Zrinski Castle.' },
      ],
      advanced: [
        {
          hr: 'Središte Međimurske županije; gusto naseljeno panonsko područje.',
          en: 'Seat of Međimurje County; a densely populated Pannonian area.',
        },
      ],
    },
  },
  {
    id: 'koprivnica',
    name: { hr: 'Koprivnica', en: 'Koprivnica' },
    lat: 46.164,
    lon: 16.828,
    countyId: 'ksz',
    region: { hr: 'Podravina', en: 'Podravina' },
    curated: true,
    curriculumTags: ['GEO-OS-A.5.4'],
    facts: {
      basic: [
        { hr: 'Grad u Podravini.', en: 'A city in the Podravina region.' },
        { hr: 'Poznat po prehrambenoj industriji.', en: 'Known for the food industry.' },
      ],
      advanced: [
        {
          hr: 'Središte Koprivničko-križevačke županije.',
          en: 'Seat of Koprivnica-Križevci County.',
        },
      ],
    },
  },
  {
    id: 'bjelovar',
    name: { hr: 'Bjelovar', en: 'Bjelovar' },
    lat: 45.899,
    lon: 16.843,
    countyId: 'bbz',
    region: { hr: 'Bilogora', en: 'Bilogora' },
    curated: true,
    curriculumTags: ['GEO-OS-A.5.4'],
    facts: {
      basic: [
        { hr: 'Grad u bilogorskom prostoru.', en: 'A city in the Bilogora area.' },
        { hr: 'Poznat po sajmovima i poljoprivredi.', en: 'Known for fairs and agriculture.' },
      ],
      advanced: [
        {
          hr: 'Središte Bjelovarsko-bilogorske županije.',
          en: 'Seat of Bjelovar-Bilogora County.',
        },
      ],
    },
  },
  {
    id: 'vinkovci',
    name: { hr: 'Vinkovci', en: 'Vinkovci' },
    lat: 45.288,
    lon: 18.805,
    countyId: 'vsz',
    region: { hr: 'Slavonija', en: 'Slavonia' },
    curated: true,
    curriculumTags: ['GEO-OS-A.5.4'],
    facts: {
      basic: [
        { hr: 'Jedan od najstarijih gradova u Europi po kontinuiranom naselju.', en: 'Among Europe’s oldest continuously inhabited cities.' },
        { hr: 'Poznat po Vinkovačkim jesenima.', en: 'Known for the Vinkovci Autumns festival.' },
      ],
      advanced: [
        {
          hr: 'Važno željezničko čvorište u Vukovarsko-srijemskoj županiji.',
          en: 'An important rail hub in Vukovar-Srijem County.',
        },
      ],
    },
  },
  {
    id: 'pozega',
    name: { hr: 'Požega', en: 'Požega' },
    lat: 45.34,
    lon: 17.685,
    countyId: 'psz',
    region: { hr: 'Slavonija', en: 'Slavonia' },
    curated: true,
    curriculumTags: ['GEO-OS-A.5.4'],
    facts: {
      basic: [
        { hr: 'Leži u Požeškoj kotlini.', en: 'Lies in the Požega valley.' },
        { hr: 'Okružena brdima i vinogradima.', en: 'Surrounded by hills and vineyards.' },
      ],
      advanced: [
        {
          hr: 'Središte Požeško-slavonske županije.',
          en: 'Seat of Požega-Slavonia County.',
        },
      ],
    },
  },
  {
    id: 'virovitica',
    name: { hr: 'Virovitica', en: 'Virovitica' },
    lat: 45.832,
    lon: 17.384,
    countyId: 'vpz',
    region: { hr: 'Podravina', en: 'Podravina' },
    curated: true,
    curriculumTags: ['GEO-OS-A.5.4'],
    facts: {
      basic: [
        { hr: 'Grad u Podravini blizu Drave.', en: 'A Podravina city near the Drava.' },
        { hr: 'Poznat po dvorcu Pejačević.', en: 'Known for Pejačević Castle.' },
      ],
      advanced: [
        {
          hr: 'Središte Virovitičko-podravske županije.',
          en: 'Seat of Virovitica-Podravina County.',
        },
      ],
    },
  },
  {
    id: 'gospic',
    name: { hr: 'Gospić', en: 'Gospić' },
    lat: 44.546,
    lon: 15.375,
    countyId: 'lsz',
    region: { hr: 'Lika', en: 'Lika' },
    curated: true,
    curriculumTags: ['GEO-OS-A.5.4'],
    facts: {
      basic: [
        { hr: 'Središte Like.', en: 'The centre of Lika.' },
        { hr: 'U blizini su Nacionalni park Plitvička jezera i Velebit.', en: 'Near Plitvice Lakes National Park and Velebit.' },
      ],
      advanced: [
        {
          hr: 'Središte Ličko-senjske županije u dinarskom gorskom prostoru.',
          en: 'Seat of Lika-Senj County in the Dinaric highland area.',
        },
      ],
    },
  },
  {
    id: 'velika-gorica',
    name: { hr: 'Velika Gorica', en: 'Velika Gorica' },
    lat: 45.713,
    lon: 16.076,
    countyId: 'zgz',
    region: { hr: 'Središnja Hrvatska', en: 'Central Croatia' },
    curated: false,
    curriculumTags: ['GEO-OS-A.5.4'],
    facts: {
      basic: [
        { hr: 'Grad južno od Zagreba, u Zagrebačkoj županiji.', en: 'A city south of Zagreb, in Zagreb County.' },
      ],
      advanced: [],
    },
  },
]

export function getPlaceById(id: string): PlaceCard | undefined {
  return PLACES.find((place) => place.id === id)
}

export function curatedPlaces(): PlaceCard[] {
  return PLACES.filter((place) => place.curated)
}

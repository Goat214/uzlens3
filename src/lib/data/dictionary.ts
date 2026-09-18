import { latinToCyrillic } from '../converter/latinToCyrillic'

/**
 * Local demo dictionary. Definitions and examples are written from scratch
 * for this project — short, original glosses, not copied from any external
 * dictionary source.
 */

export interface DictionaryEntry {
  id: string
  latin: string
  definition: string
  partOfSpeech: string
  english?: string
  root?: string
  structure?: string
  relatedWords: string[]
  example: string
}

const RAW_ENTRIES: Omit<DictionaryEntry, 'id'>[] = [
  {
    latin: "mehmondo‘stlik",
    definition: 'Mehmonni yaxshi kutish va izzat qilish xususiyati.',
    partOfSpeech: 'Ot',
    english: 'hospitality',
    root: 'mehmon',
    structure: "mehmon + do‘st + lik",
    relatedWords: ['mehmon', "mehmondo‘st", 'mehmonnavoz', 'mehmonxona'],
    example: "O‘zbek xalqining mehmondo‘stligi qadimdan mashhur.",
  },
  {
    latin: 'kitob',
    definition: "Qog‘ozga bosilgan yoki yozilgan, muqovalangan asar.",
    partOfSpeech: 'Ot',
    english: 'book',
    relatedWords: ['kitobxon', 'kitobxona', 'kutubxona'],
    example: 'Bu kitobni bir kechada o‘qib tugatdim.',
  },
  {
    latin: 'mehmon',
    definition: "Boshqa birovnikiga tashrif buyurgan kishi.",
    partOfSpeech: 'Ot',
    english: 'guest',
    relatedWords: ["mehmondo‘stlik", 'mehmonxona', 'mehmonnavoz'],
    example: 'Bugun bizga mehmon keladi.',
  },
  {
    latin: "mehmondo‘st",
    definition: "Mehmonlarni yaxshi kutadigan, izzatli kishi.",
    partOfSpeech: 'Sifat',
    root: 'mehmon',
    structure: "mehmon + do‘st",
    relatedWords: ['mehmon', "mehmondo‘stlik"],
    example: "Bu oila juda mehmondo‘st.",
  },
  {
    latin: 'mehmonnavoz',
    definition: 'Mehmonlarni samimiy va saxiylik bilan kutadigan.',
    partOfSpeech: 'Sifat',
    root: 'mehmon',
    relatedWords: ['mehmon', "mehmondo‘stlik"],
    example: 'Mehmonnavoz oila hammani ochiq eshik bilan kutib oladi.',
  },
  {
    latin: 'mehmonxona',
    definition: "Mehmonlar qabul qilinadigan xona yoki bino.",
    partOfSpeech: 'Ot',
    english: 'guest room / hotel',
    root: 'mehmon',
    structure: 'mehmon + xona',
    relatedWords: ['mehmon', 'xona'],
    example: 'Mehmonxonada choy va shirinliklar tayyorlandi.',
  },
  {
    latin: 'maktab',
    definition: "Bolalar ta'lim oladigan muassasa.",
    partOfSpeech: 'Ot',
    english: 'school',
    relatedWords: ['o‘quvchi', "o‘qituvchi", "ta'lim"],
    example: 'Maktab ertalab soat sakkizda boshlanadi.',
  },
  {
    latin: 'uy',
    definition: 'Odamlar yashaydigan bino yoki xona.',
    partOfSpeech: 'Ot',
    english: 'house',
    relatedWords: ['xonadon', "ro‘zg‘or"],
    example: 'Uyimiz shahar chekkasida joylashgan.',
  },
  {
    latin: 'non',
    definition: "Undan yopilgan, kundalik ovqatlanishda ishlatiladigan mahsulot.",
    partOfSpeech: 'Ot',
    english: 'bread',
    relatedWords: ['nonvoy', 'noni'],
    example: 'Issiq non hidi butun hovlini tutdi.',
  },
  {
    latin: 'suv',
    definition: "Rangsiz, hidsiz suyuqlik; hayot uchun zarur tabiiy modda.",
    partOfSpeech: 'Ot',
    english: 'water',
    relatedWords: ['daryo', 'ko‘l', 'yomg‘ir'],
    example: 'Sug‘orish uchun tog‘dan suv tortiladi.',
  },
  {
    latin: "tog‘",
    definition: 'Yer yuzasidan baland ko‘tarilgan katta tabiiy balandlik.',
    partOfSpeech: 'Ot',
    english: 'mountain',
    relatedWords: ['tog‘lik', 'dara', 'cho‘qqi'],
    example: "Tog‘ cho‘qqisi qorga burkangan.",
  },
  {
    latin: 'oila',
    definition: "Bir-biriga qarindosh bo‘lgan, birga yashaydigan kishilar guruhi.",
    partOfSpeech: 'Ot',
    english: 'family',
    relatedWords: ["oilaviy", "farzand", 'ota-ona'],
    example: 'Oilamiz bilan bayramni birga nishonladik.',
  },
  {
    latin: "do‘st",
    definition: "Ishonchli, yaqin munosabatdagi kishi.",
    partOfSpeech: 'Ot',
    english: 'friend',
    relatedWords: ["do‘stlik", "do‘stona"],
    example: "Eng yaqin do‘stim bilan maslahatlashdim.",
  },
  {
    latin: "do‘stlik",
    definition: "Do‘stlar orasidagi yaqin va ishonchli munosabat.",
    partOfSpeech: 'Ot',
    english: 'friendship',
    root: "do‘st",
    structure: "do‘st + lik",
    relatedWords: ["do‘st", "do‘stona"],
    example: "Ularning do‘stligi bolalikdan boshlangan.",
  },
  {
    latin: 'ona',
    definition: 'Farzand tug‘gan yoki tarbiyalayotgan ayol.',
    partOfSpeech: 'Ot',
    english: 'mother',
    relatedWords: ['ota', 'ota-ona'],
    example: 'Onam har kuni ertalab nonushta tayyorlaydi.',
  },
  {
    latin: 'ota',
    definition: 'Farzandning erkak ota-onasi.',
    partOfSpeech: 'Ot',
    english: 'father',
    relatedWords: ['ona', 'ota-ona'],
    example: 'Otam ishdan kechqurun qaytadi.',
  },
  {
    latin: 'bola',
    definition: 'Yosh, voyaga yetmagan inson.',
    partOfSpeech: 'Ot',
    english: 'child',
    relatedWords: ['bolalik', "farzand"],
    example: 'Hovlida bolalar o‘ynayapti.',
  },
  {
    latin: 'ish',
    definition: 'Kishi bajaradigan mehnat yoki faoliyat.',
    partOfSpeech: 'Ot',
    english: 'work',
    relatedWords: ['ishchi', "ishlamoq"],
    example: 'Ish ertalab soat to‘qqizda boshlanadi.',
  },
  {
    latin: "o‘qituvchi",
    definition: 'Boshqalarga bilim va ko‘nikma o‘rgatuvchi kasb egasi.',
    partOfSpeech: 'Ot',
    english: 'teacher',
    root: "o‘qi",
    relatedWords: ['maktab', 'talaba', "o‘quvchi"],
    example: "O‘qituvchimiz darsni juda qiziqarli o‘tadi.",
  },
  {
    latin: 'talaba',
    definition: 'Oliy o‘quv yurtida tahsil olayotgan shaxs.',
    partOfSpeech: 'Ot',
    english: 'student',
    relatedWords: ['universitet', "o‘qituvchi"],
    example: 'Talaba imtihonga tayyorlanmoqda.',
  },
  {
    latin: 'shahar',
    definition: "Ko‘p aholi yashaydigan, rivojlangan yashash maskani.",
    partOfSpeech: 'Ot',
    english: 'city',
    relatedWords: ['shaharlik', 'qishloq'],
    example: 'Toshkent — O‘zbekistonning poytaxt shahri.',
  },
  {
    latin: 'qishloq',
    definition: "Aholi soni kam, qishloq xo‘jaligi bilan shug‘ullanadigan aholi punkti.",
    partOfSpeech: 'Ot',
    english: 'village',
    relatedWords: ['qishloqlik', 'shahar'],
    example: 'Yozni qishloqdagi buvimnikida o‘tkazdim.',
  },
  {
    latin: 'bozor',
    definition: "Turli mahsulotlar sotib olinadigan yoki sotiladigan joy.",
    partOfSpeech: 'Ot',
    english: 'market',
    relatedWords: ['savdo', 'sotuvchi'],
    example: 'Bozorda mevalar juda arzon edi.',
  },
  {
    latin: 'choy',
    definition: "Choy bargidan tayyorlanadigan, issiq ichiladigan ichimlik.",
    partOfSpeech: 'Ot',
    english: 'tea',
    relatedWords: ['choyxona', 'piyola'],
    example: 'Mehmonlarga issiq choy quyildi.',
  },
  {
    latin: 'gul',
    definition: "O‘simlikning rangdor, xushbo‘y qismi.",
    partOfSpeech: 'Ot',
    english: 'flower',
    relatedWords: ['gulzor', "gulchi"],
    example: 'Bog‘da har xil ranglardagi gullar ochilgan.',
  },
  {
    latin: "bog‘",
    definition: "Daraxt va o‘simliklar ekilgan hudud.",
    partOfSpeech: 'Ot',
    english: 'garden',
    relatedWords: ['bog‘bon', 'gulzor'],
    example: "Bog‘da olma va nok daraxtlari ko‘p.",
  },
  {
    latin: 'daryo',
    definition: "Katta, doimiy oqadigan tabiiy suv oqimi.",
    partOfSpeech: 'Ot',
    english: 'river',
    relatedWords: ['suv', 'ko‘l'],
    example: 'Daryo bo‘yida sayr qildik.',
  },
  {
    latin: 'quyosh',
    definition: "Yerga yorug‘lik va issiqlik beruvchi osmon jismi.",
    partOfSpeech: 'Ot',
    english: 'sun',
    relatedWords: ['quyoshli', "nur"],
    example: 'Quyosh tog‘ ortidan chiqdi.',
  },
  {
    latin: 'yulduz',
    definition: "Kechasi osmonda ko‘rinadigan yorug‘ jism.",
    partOfSpeech: 'Ot',
    english: 'star',
    relatedWords: ['osmon', "tun"],
    example: 'Kechasi osmonda minglab yulduz porladi.',
  },
  {
    latin: 'vaqt',
    definition: "Voqealarning davomiyligi yoki sodir bo‘lish payti.",
    partOfSpeech: 'Ot',
    english: 'time',
    relatedWords: ['soat', 'muddat'],
    example: 'Vaqt tez o‘tib ketadi.',
  },
  {
    latin: 'sevgi',
    definition: "Kuchli, samimiy yaxshi ko‘rish tuyg‘usi.",
    partOfSpeech: 'Ot',
    english: 'love',
    relatedWords: ['sevmoq', 'sevgili'],
    example: 'Ona sevgisi hech narsaga tenglashmaydi.',
  },
  {
    latin: 'yurt',
    definition: "Kishi tug‘ilib o‘sgan yer, vatan.",
    partOfSpeech: 'Ot',
    english: 'homeland',
    relatedWords: ['vatan', 'yurtdosh'],
    example: 'Har bir inson o‘z yurtini sevadi.',
  },
  {
    latin: "kutubxona",
    definition: "Kitoblar saqlanadigan va o‘qish uchun beriladigan joy.",
    partOfSpeech: 'Ot',
    english: 'library',
    root: 'kitob',
    relatedWords: ['kitob', "kitobxon"],
    example: 'Universitet kutubxonasida minglab kitob bor.',
  },
]

export const DICTIONARY: DictionaryEntry[] = RAW_ENTRIES.map((entry, i) => ({
  id: `w${i + 1}`,
  ...entry,
}))

function normalizeKey(word: string): string {
  return word
    .toLowerCase()
    .replace(/[\u2018\u2019\u02BC`´']/g, '\u02BB')
    .trim()
}

export function getCyrillic(entry: DictionaryEntry): string {
  return latinToCyrillic(entry.latin)
}

export function findWord(query: string): DictionaryEntry | undefined {
  const key = normalizeKey(query)
  if (!key) return undefined
  return DICTIONARY.find((entry) => normalizeKey(entry.latin) === key)
}

export function searchWords(query: string): DictionaryEntry[] {
  const key = normalizeKey(query)
  if (!key) return DICTIONARY
  return DICTIONARY.filter(
    (entry) =>
      normalizeKey(entry.latin).includes(key) ||
      entry.definition.toLowerCase().includes(query.toLowerCase()),
  )
}

/** Uzbekistan regions + districts used by the checkout address selector. */

export interface Region {
  name: string
  districts: string[]
}

export const REGIONS: Region[] = [
  {
    name: 'Toshkent shahri',
    districts: [
      'Bektemir', 'Chilonzor', 'Mirobod', 'Mirzo Ulug‘bek', 'Olmazor', 'Sergeli',
      'Shayxontohur', 'Uchtepa', 'Yakkasaroy', 'Yashnobod', 'Yunusobod', 'Yangihayot',
    ],
  },
  {
    name: 'Toshkent viloyati',
    districts: [
      'Angren', 'Bekobod', 'Bo‘ka', 'Bo‘stonliq', 'Chinoz', 'Chirchiq', 'Nurafshon',
      'Ohangaron', 'Oqqo‘rg‘on', 'Parkent', 'Piskent', 'Quyichirchiq', 'Yangiyo‘l',
      'O‘rtachirchiq', 'Yuqorichirchiq', 'Zangiota',
    ],
  },
  {
    name: 'Andijon',
    districts: [
      'Andijon shahri', 'Asaka', 'Baliqchi', 'Bo‘ston', 'Buloqboshi', 'Izboskan',
      'Jalaquduq', 'Xo‘jaobod', 'Qo‘rg‘ontepa', 'Marhamat', 'Oltinko‘l', 'Paxtaobod', 'Shahrixon', 'Ulug‘nor',
    ],
  },
  {
    name: 'Buxoro',
    districts: ['Buxoro shahri', 'Kogon', 'G‘ijduvon', 'Jondor', 'Olot', 'Peshku', 'Qorako‘l', 'Qorovulbozor', 'Romitan', 'Shofirkon', 'Vobkent'],
  },
  {
    name: 'Farg‘ona',
    districts: ['Farg‘ona shahri', 'Marg‘ilon', 'Qo‘qon', 'Quvasoy', 'Beshariq', 'Bog‘dod', 'Buvayda', 'Dang‘ara', 'Furqat', 'Oltiariq', 'Qo‘shtepa', 'Rishton', 'So‘x', 'Toshloq', 'Uchko‘prik', 'O‘zbekiston', 'Yozyovon'],
  },
  {
    name: 'Jizzax',
    districts: ['Jizzax shahri', 'Arnasoy', 'Baxmal', 'Do‘stlik', 'Forish', 'G‘allaorol', 'Sharof Rashidov', 'Mirzacho‘l', 'Paxtakor', 'Yangiobod', 'Zomin', 'Zafarobod'],
  },
  {
    name: 'Xorazm',
    districts: ['Urganch', 'Xiva', 'Bog‘ot', 'Gurlan', 'Qo‘shko‘pir', 'Shovot', 'Xonqa', 'Yangiariq', 'Yangibozor', 'Hazorasp', 'Tuproqqal’a'],
  },
  {
    name: 'Namangan',
    districts: ['Namangan shahri', 'Chortoq', 'Chust', 'Kosonsoy', 'Mingbuloq', 'Norin', 'Pop', 'To‘raqo‘rg‘on', 'Uychi', 'Uchqo‘rg‘on', 'Yangiqo‘rg‘on'],
  },
  {
    name: 'Navoiy',
    districts: ['Navoiy shahri', 'Zarafshon', 'G‘azg‘on', 'Karmana', 'Konimex', 'Navbahor', 'Nurota', 'Qiziltepa', 'Tomdi', 'Uchquduq', 'Xatirchi'],
  },
  {
    name: 'Qashqadaryo',
    districts: ['Qarshi', 'Shahrisabz', 'Chiroqchi', 'Dehqonobod', 'G‘uzor', 'Kasbi', 'Kitob', 'Koson', 'Mirishkor', 'Muborak', 'Nishon', 'Yakkabog‘', 'Qamashi'],
  },
  {
    name: 'Qoraqalpog‘iston',
    districts: ['Nukus', 'Amudaryo', 'Beruniy', 'Chimboy', 'Ellikqal’a', 'Kegeyli', 'Mo‘ynoq', 'Nukus tumani', 'Qanliko‘l', 'Qo‘ng‘irot', 'Qorao‘zak', 'Shumanay', 'Taxtako‘pir', 'To‘rtko‘l', 'Xo‘jayli'],
  },
  {
    name: 'Samarqand',
    districts: ['Samarqand shahri', 'Kattaqo‘rg‘on', 'Bulung‘ur', 'Ishtixon', 'Jomboy', 'Narpay', 'Nurobod', 'Oqdaryo', 'Pastdarg‘om', 'Paxtachi', 'Payariq', 'Qo‘shrabot', 'Toyloq', 'Urgut'],
  },
  {
    name: 'Sirdaryo',
    districts: ['Guliston', 'Shirin', 'Yangiyer', 'Boyovut', 'Sardoba', 'Mirzaobod', 'Oqoltin', 'Sayxunobod', 'Sirdaryo', 'Xovos'],
  },
  {
    name: 'Surxondaryo',
    districts: ['Termiz', 'Angor', 'Bandixon', 'Boysun', 'Denov', 'Jarqo‘rg‘on', 'Muzrabot', 'Oltinsoy', 'Qiziriq', 'Qumqo‘rg‘on', 'Sariosiyo', 'Sherobod', 'Sho‘rchi', 'Uzun'],
  },
]

export const REGION_NAMES = REGIONS.map((r) => r.name)

export function districtsOf(regionName: string): string[] {
  return REGIONS.find((r) => r.name === regionName)?.districts ?? []
}

/** Same-day courier is only offered inside Tashkent city. */
export function supportsExpress(regionName: string): boolean {
  return regionName === 'Toshkent shahri'
}

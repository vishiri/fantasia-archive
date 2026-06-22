import fs from 'node:fs'
import path from 'node:path'

const repoRoot = path.resolve(import.meta.dirname, '..')

/** @type {Record<string, { singularPluralMissing: { bothIntro: string, singularBullet: string, pluralBullet: string, usingFallback: string }, singularColumnLabel: string, pluralColumnLabel: string }>} */
const byLocale = {
  ar: {
    singularPluralMissing: {
      bothIntro: 'ترجمات مفقودة للغة الحالية:',
      singularBullet: 'صيغة المفرد مفقودة',
      pluralBullet: 'صيغة الجمع مفقودة',
      usingFallback: 'يتم استخدام البديل: {fallbackLanguageName}'
    },
    singularColumnLabel: 'المفرد',
    pluralColumnLabel: 'الجمع'
  },
  de: {
    singularPluralMissing: {
      bothIntro: 'Fehlende Übersetzungen für die aktuelle Sprache:',
      singularBullet: 'Singularform fehlt',
      pluralBullet: 'Pluralform fehlt',
      usingFallback: 'Fallback verwendet: {fallbackLanguageName}'
    },
    singularColumnLabel: 'Singular',
    pluralColumnLabel: 'Plural'
  },
  el: {
    singularPluralMissing: {
      bothIntro: 'Λείπουν μεταφράσεις για την τρέχουσα γλώσσα:',
      singularBullet: 'Λείπει η ενικός τύπος',
      pluralBullet: 'Λείπει ο πληθυντικός τύπος',
      usingFallback: 'Χρησιμοποιείται εφεδρική: {fallbackLanguageName}'
    },
    singularColumnLabel: 'Ενικός',
    pluralColumnLabel: 'Πληθυντικός'
  },
  es: {
    singularPluralMissing: {
      bothIntro: 'Faltan traducciones para el idioma actual:',
      singularBullet: 'Falta la forma singular',
      pluralBullet: 'Falta la forma plural',
      usingFallback: 'Se usa el respaldo de {fallbackLanguageName}'
    },
    singularColumnLabel: 'Singular',
    pluralColumnLabel: 'Plural'
  },
  fi: {
    singularPluralMissing: {
      bothIntro: 'Puuttuvia käännöksiä nykyiselle kielelle:',
      singularBullet: 'Yksikkömuoto puuttuu',
      pluralBullet: 'Monikkomuoto puuttuu',
      usingFallback: 'Käytetään varalla olevaa: {fallbackLanguageName}'
    },
    singularColumnLabel: 'Yksikkö',
    pluralColumnLabel: 'Monikko'
  },
  fr: {
    singularPluralMissing: {
      bothIntro: 'Traductions manquantes pour la langue actuelle :',
      singularBullet: 'Forme singulière manquante',
      pluralBullet: 'Forme plurielle manquante',
      usingFallback: 'Solution de repli utilisée : {fallbackLanguageName}'
    },
    singularColumnLabel: 'Singulier',
    pluralColumnLabel: 'Pluriel'
  },
  hi: {
    singularPluralMissing: {
      bothIntro: 'वर्तमान भाषा के लिए अनुवाद अनुपलब्ध हैं:',
      singularBullet: 'एकवचन रूप अनुपलब्ध है',
      pluralBullet: 'बहुवचन रूप अनुपलब्ध है',
      usingFallback: 'फ़ॉलबैक उपयोग किया गया: {fallbackLanguageName}'
    },
    singularColumnLabel: 'एकवचन',
    pluralColumnLabel: 'बहुवचन'
  },
  it: {
    singularPluralMissing: {
      bothIntro: 'Traduzioni mancanti per la lingua attuale:',
      singularBullet: 'Forma singolare mancante',
      pluralBullet: 'Forma plurale mancante',
      usingFallback: 'Usato fallback di {fallbackLanguageName}'
    },
    singularColumnLabel: 'Singolare',
    pluralColumnLabel: 'Plurale'
  },
  ja: {
    singularPluralMissing: {
      bothIntro: '現在の言語の翻訳が不足しています:',
      singularBullet: '単数形がありません',
      pluralBullet: '複数形がありません',
      usingFallback: 'フォールバックを使用: {fallbackLanguageName}'
    },
    singularColumnLabel: '単数',
    pluralColumnLabel: '複数'
  },
  nb: {
    singularPluralMissing: {
      bothIntro: 'Manglende oversettelser for gjeldende språk:',
      singularBullet: 'Entallsform mangler',
      pluralBullet: 'Flertallsform mangler',
      usingFallback: 'Bruker reserveversjon: {fallbackLanguageName}'
    },
    singularColumnLabel: 'Entall',
    pluralColumnLabel: 'Flertall'
  },
  pt: {
    singularPluralMissing: {
      bothIntro: 'Faltam traduções para o idioma atual:',
      singularBullet: 'Forma singular em falta',
      pluralBullet: 'Forma plural em falta',
      usingFallback: 'Usando fallback de {fallbackLanguageName}'
    },
    singularColumnLabel: 'Singular',
    pluralColumnLabel: 'Plural'
  },
  ru: {
    singularPluralMissing: {
      bothIntro: 'Отсутствуют переводы для выбранного языка:',
      singularBullet: 'Отсутствует форма единственного числа',
      pluralBullet: 'Отсутствует форма множественного числа',
      usingFallback: 'Используется резервный вариант: {fallbackLanguageName}'
    },
    singularColumnLabel: 'Единственное число',
    pluralColumnLabel: 'Множественное число'
  },
  sv: {
    singularPluralMissing: {
      bothIntro: 'Saknade översättningar för det valda språket:',
      singularBullet: 'Singularform saknas',
      pluralBullet: 'Pluralform saknas',
      usingFallback: 'Använder reserv av {fallbackLanguageName}'
    },
    singularColumnLabel: 'Singular',
    pluralColumnLabel: 'Plural'
  },
  uk: {
    singularPluralMissing: {
      bothIntro: 'Переклади для вибраної мови відсутні:',
      singularBullet: 'Відсутня форма однини',
      pluralBullet: 'Відсутня форма множини',
      usingFallback: 'Використовується резервний варіант: {fallbackLanguageName}'
    },
    singularColumnLabel: 'Однина',
    pluralColumnLabel: 'Множина'
  },
  zh: {
    singularPluralMissing: {
      bothIntro: '当前语言缺少翻译:',
      singularBullet: '缺少单数形式',
      pluralBullet: '缺少复数形式',
      usingFallback: '使用回退: {fallbackLanguageName}'
    },
    singularColumnLabel: '单数',
    pluralColumnLabel: '复数'
  }
}

const englishBlock = `  singularPluralMissing: {
    bothIntro: 'Missing translations for current language:',
    singularBullet: 'Singular form missing',
    pluralBullet: 'Plural form missing',
    usingFallback: 'Using fallback of {fallbackLanguageName}'
  },`

for (const [loc, t] of Object.entries(byLocale)) {
  const localizedBlock = `  singularPluralMissing: {
    bothIntro: '${t.singularPluralMissing.bothIntro}',
    singularBullet: '${t.singularPluralMissing.singularBullet}',
    pluralBullet: '${t.singularPluralMissing.pluralBullet}',
    usingFallback: '${t.singularPluralMissing.usingFallback}'
  },`

  const settingsPath = path.join(repoRoot, 'i18n', loc, 'dialogs', 'L_projectSettings.ts')
  let settingsText = fs.readFileSync(settingsPath, 'utf8')
  if (!settingsText.includes('singularPluralMissing')) {
    throw new Error(`${settingsPath}: missing singularPluralMissing block`)
  }
  settingsText = settingsText.replace(englishBlock, localizedBlock)
  if (settingsText.includes("bothIntro: 'Missing translations for current language:'")) {
    throw new Error(`${settingsPath}: singularPluralMissing block not replaced`)
  }
  fs.writeFileSync(settingsPath, settingsText)

  const inputPath = path.join(repoRoot, 'i18n', loc, 'components', 'elements', 'FaLocaleTranslationsInput', 'L_FaLocaleTranslationsInput.ts')
  let inputText = fs.readFileSync(inputPath, 'utf8')
  inputText = inputText.replace(
    "singularColumnLabel: 'Singular',\n  pluralColumnLabel: 'Plural'",
    `singularColumnLabel: '${t.singularColumnLabel}',\n  pluralColumnLabel: '${t.pluralColumnLabel}'`
  )
  fs.writeFileSync(inputPath, inputText)
}

console.log('applied singular/plural locale translations for', Object.keys(byLocale).length, 'locales')

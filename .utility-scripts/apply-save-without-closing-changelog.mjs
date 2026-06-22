import fs from 'node:fs'
import path from 'node:path'

const repoRoot = path.resolve(import.meta.dirname, '..')

/** @type {Record<string, { featureHeading: string, bugfixHeading: string, feature: string, deleteWorld: string, swedenFlag: string }>} */
const byLocale = {
  ar: {
    featureHeading: '### ميزات جديدة',
    bugfixHeading: '### إصلاحات الأخطاء والتحسينات',
    feature:
      '- **إعدادات المشروع**: **حفظ دون إغلاق** يحفظ إعدادات المشروع مثل **حفظ الإعدادات** لكن يبقي مربع الحوار مفتوحًا لمتابعة التحرير.',
    deleteWorld:
      '- **إعدادات المشروع**: زر **حذف العالم** في صف تفاصيل **العوالم** يتماشى عموديًا مع حقول **اسم العالم** و**لون العالم**.',
    swedenFlag:
      '- **محدد اللغة**: **Svenska** يعرض الآن علم السويد بدل علم السلفادور.'
  },
  de: {
    featureHeading: '### Neue Funktionen',
    bugfixHeading: '### Fehlerbehebungen und Optimierungen',
    feature:
      '- **Projekteinstellungen**: **Speichern ohne zu schließen** speichert Projekteinstellungen wie **Einstellungen speichern**, lässt das Dialogfenster aber geöffnet.',
    deleteWorld:
      '- **Projekteinstellungen**: **Welt löschen** in der Detailzeile **Welten** ist vertikal mit **Weltname** und **Weltfarbe** ausgerichtet.',
    swedenFlag:
      '- **Sprachauswahl**: **Svenska** zeigt jetzt die Schwedenflagge statt der Flagge von El Salvador.'
  },
  el: {
    featureHeading: '### Νέες δυνατότητες',
    bugfixHeading: '### Διορθώσεις σφαλμάτων και βελτιστοποιήσεις',
    feature:
      '- **Ρυθμίσεις έργου**: **Αποθήκευση χωρίς κλείσιμο** αποθηκεύει όπως **Αποθήκευση ρυθμίσεων** αλλά κρατά το παράθυρο ανοιχτό.',
    deleteWorld:
      '- **Ρυθμίσεις έργου**: **Διαγραφή κόσμου** στη σειρά λεπτομερειών **Κόσμοι** ευθυγραμμίζεται κάθετα με **Όνομα κόσμου** και **Χρώμα κόσμου**.',
    swedenFlag:
      '- **Επιλογέας γλώσσας**: **Svenska** εμφανίζει πλέον τη σημαία της Σουηδίας αντί του Ελ Σαλβαδόρ.'
  },
  es: {
    featureHeading: '### Nuevas funciones',
    bugfixHeading: '### Correcciones de errores y optimizaciones',
    feature:
      '- **Configuración del proyecto**: **Guardar sin cerrar** guarda como **Guardar configuración** pero mantiene el diálogo abierto para seguir editando.',
    deleteWorld:
      '- **Configuración del proyecto**: **Eliminar mundo** en la fila de detalle **Mundos** se alinea verticalmente con **Nombre del mundo** y **Color del mundo**.',
    swedenFlag:
      '- **Selector de idioma**: **Svenska** muestra ahora la bandera de Suecia en lugar de la de El Salvador.'
  },
  fi: {
    featureHeading: '### Uusia ominaisuuksia',
    bugfixHeading: '### Virhekorjaukset ja optimoinnit',
    feature:
      '- **Projektiasetukset**: **Tallenna sulkematta** tallentaa kuten **Tallenna asetukset**, mutta jättää valintaikkunan auki.',
    deleteWorld:
      '- **Projektiasetukset**: **Poista maailma** **Maailmat**-tietorivillä kohdistuu pystysuunnassa **Maailman nimi**- ja **Maailman väri** -kenttiin.',
    swedenFlag:
      '- **Kielenvalitsin**: **Svenska** näyttää nyt Ruotsin lipun El Salvadorin lipun sijaan.'
  },
  fr: {
    featureHeading: '### Nouvelles fonctionnalités',
    bugfixHeading: '### Corrections de bugs et optimisations',
    feature:
      '- **Paramètres du projet** : **Enregistrer sans fermer** enregistre comme **Enregistrer les paramètres** mais garde la boîte de dialogue ouverte.',
    deleteWorld:
      '- **Paramètres du projet** : **Supprimer le monde** dans la ligne de détail **Mondes** s’aligne verticalement avec **Nom du monde** et **Couleur du monde**.',
    swedenFlag:
      '- **Sélecteur de langue** : **Svenska** affiche désormais le drapeau de la Suède au lieu de celui du Salvador.'
  },
  hi: {
    featureHeading: '### नई सुविधाएँ',
    bugfixHeading: '### बगफिक्स और अनुकूलन',
    feature:
      '- **प्रोजेक्ट सेटिंग्स**: **बिना बंद किए सहेजें** **सेटिंग्स सहेजें** की तरह सहेजता है पर संवाद खुला रहता है।',
    deleteWorld:
      '- **प्रोजेक्ट सेटिंग्स**: **दुनिया हटाएँ** **दुनियाएँ** विवरण पंक्ति में **दुनिया का नाम** और **दुनिया का रंग** के साथ ऊर्ध्व संरेखित है।',
    swedenFlag:
      '- **भाषा चयनकर्ता**: **Svenska** अब एल साल्वाडोर के बजाय स्वीडन का झंडा दिखाता है।'
  },
  it: {
    featureHeading: '### Nuove funzionalità',
    bugfixHeading: '### Correzioni di bug e ottimizzazioni',
    feature:
      '- **Impostazioni progetto**: **Salva senza chiudere** salva come **Salva impostazioni** ma lascia aperto il dialogo.',
    deleteWorld:
      '- **Impostazioni progetto**: **Elimina mondo** nella riga dettaglio **Mondi** si allinea verticalmente con **Nome mondo** e **Colore mondo**.',
    swedenFlag:
      '- **Selettore lingua**: **Svenska** mostra ora la bandiera della Svezia invece di quella di El Salvador.'
  },
  ja: {
    featureHeading: '### 新機能',
    bugfixHeading: '### バグ修正と最適化',
    feature:
      '- **プロジェクト設定**: **閉じずに保存**は**設定を保存**と同様に保存し、ダイアログは開いたままです。',
    deleteWorld:
      '- **プロジェクト設定**: **世界を削除**は**世界**詳細行で**世界名**と**世界の色**に縦方向で揃います。',
    swedenFlag:
      '- **言語セレクター**: **Svenska**はエルサルバドルではなくスウェーデンの国旗を表示します。'
  },
  nb: {
    featureHeading: '### Nye funksjoner',
    bugfixHeading: '### Feilrettinger og optimaliseringer',
    feature:
      '- **Prosjektinnstillinger**: **Lagre uten å lukke** lagrer som **Lagre innstillinger**, men holder dialogen åpen.',
    deleteWorld:
      '- **Prosjektinnstillinger**: **Slett verden** på **Verdener**-detaljraden er vertikalt på linje med **Verdensnavn** og **Verdensfarge**.',
    swedenFlag:
      '- **Språkvelger**: **Svenska** viser nå Sveriges flagg i stedet for El Salvadors.'
  },
  pt: {
    featureHeading: '### Novos recursos',
    bugfixHeading: '### Correções de bugs e otimizações',
    feature:
      '- **Configurações do projeto**: **Salvar sem fechar** salva como **Salvar configurações**, mas mantém o diálogo aberto.',
    deleteWorld:
      '- **Configurações do projeto**: **Excluir mundo** na linha de detalhes **Mundos** alinha verticalmente com **Nome do mundo** e **Cor do mundo**.',
    swedenFlag:
      '- **Seletor de idioma**: **Svenska** agora mostra a bandeira da Suécia em vez de El Salvador.'
  },
  ru: {
    featureHeading: '### Новые возможности',
    bugfixHeading: '### Исправления ошибок и оптимизация',
    feature:
      '- **Настройки проекта**: **Сохранить без закрытия** сохраняет как **Сохранить настройки**, но оставляет диалог открытым.',
    deleteWorld:
      '- **Настройки проекта**: **Удалить мир** в строке **Миры** выровнен по вертикали с **Имя мира** и **Цвет мира**.',
    swedenFlag:
      '- **Выбор языка**: **Svenska** теперь показывает флаг Швеции вместо Сальвадора.'
  },
  sv: {
    featureHeading: '### Nya funktioner',
    bugfixHeading: '### Buggfixar och optimeringar',
    feature:
      '- **Projektinställningar**: **Spara utan att stänga** sparar som **Spara inställningar** men håller dialogen öppen.',
    deleteWorld:
      '- **Projektinställningar**: **Ta bort värld** i **Världar**-detaljraden linjerar vertikalt med **Världens namn** och **Världens färg**.',
    swedenFlag:
      '- **Språkväljare**: **Svenska** visar nu Sveriges flagga i stället för El Salvadors flagga.'
  },
  uk: {
    featureHeading: '### Нові функції',
    bugfixHeading: '### Виправлення помилок і оптимізація',
    feature:
      '- **Налаштування проєкту**: **Зберегти без закриття** зберігає як **Зберегти налаштування**, але лишає діалог відкритим.',
    deleteWorld:
      '- **Налаштування проєкту**: **Видалити світ** у рядку **Світи** вирівняно по вертикалі з **Назва світу** та **Колір світу**.',
    swedenFlag:
      '- **Вибір мови**: **Svenska** тепер показує прапор Швеції замість Сальвадору.'
  },
  zh: {
    featureHeading: '### 新功能',
    bugfixHeading: '### 错误修复与优化',
    feature:
      '- **项目设置**：**保存而不关闭**与**保存设置**同样保存，但保持对话框打开以便继续编辑。',
    deleteWorld:
      '- **项目设置**：**世界**详情行中的**删除世界**与**世界名称**和**世界颜色**字段垂直对齐。',
    swedenFlag:
      '- **语言选择器**：**Svenska** 现在显示瑞典国旗，而非萨尔瓦多国旗。'
  }
}

/**
 * @param {string} text
 * @param {string} heading
 * @param {string} bullet
 */
function appendBulletUnderHeading (text, heading, bullet) {
  if (text.includes(bullet)) {
    return text
  }
  const idx = text.indexOf(heading)
  if (idx === -1) {
    return text
  }
  const lineEnd = text.indexOf('\n', idx)
  const insertAt = lineEnd === -1 ? text.length : lineEnd + 1
  return `${text.slice(0, insertAt)}${bullet}\n${text.slice(insertAt)}`
}

for (const [loc, copy] of Object.entries(byLocale)) {
  const filePath = path.join(repoRoot, 'i18n', loc, 'documents', 'changeLog.md')
  const text = fs.readFileSync(filePath, 'utf8')
  if (text.includes(copy.feature)) {
    continue
  }

  const versionHeading = '## 2.4.14'
  const versionIdx = text.indexOf(versionHeading)
  if (versionIdx === -1) {
    throw new Error(`missing 2.4.14 section in ${filePath}`)
  }
  const nextVersionIdx = text.indexOf('\n## 2.4.13', versionIdx)
  const sectionEnd = nextVersionIdx === -1 ? text.length : nextVersionIdx
  let section = text.slice(versionIdx, sectionEnd)
  const restBefore = text.slice(0, versionIdx)
  const restAfter = text.slice(sectionEnd)

  if (section.includes(copy.featureHeading)) {
    section = appendBulletUnderHeading(section, copy.featureHeading, copy.feature)
  } else {
    section += `\n${copy.featureHeading}\n${copy.feature}\n`
  }

  if (section.includes(copy.bugfixHeading)) {
    section = appendBulletUnderHeading(section, copy.bugfixHeading, copy.deleteWorld)
    section = appendBulletUnderHeading(section, copy.bugfixHeading, copy.swedenFlag)
  } else {
    section += `\n${copy.bugfixHeading}\n${copy.deleteWorld}\n${copy.swedenFlag}\n`
  }

  fs.writeFileSync(filePath, restBefore + section + restAfter)
}

console.log('patched changelog bullets for', Object.keys(byLocale).length, 'locales')

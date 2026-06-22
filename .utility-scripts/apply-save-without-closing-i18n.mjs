import fs from 'node:fs'
import path from 'node:path'

const repoRoot = path.resolve(import.meta.dirname, '..')

/** @type {Record<string, string>} */
const byLocale = {
  ar: 'حفظ دون إغلاق',
  de: 'Speichern ohne zu schließen',
  el: 'Αποθήκευση χωρίς κλείσιμο',
  es: 'Guardar sin cerrar',
  fi: 'Tallenna sulkematta',
  fr: 'Enregistrer sans fermer',
  hi: 'बिना बंद किए सहेजें',
  it: 'Salva senza chiudere',
  ja: '閉じずに保存',
  nb: 'Lagre uten å lukke',
  pt: 'Salvar sem fechar',
  ru: 'Сохранить без закрытия',
  sv: 'Spara utan att stänga',
  uk: 'Зберегти без закриття',
  zh: '保存而不关闭'
}

for (const [loc, label] of Object.entries(byLocale)) {
  const filePath = path.join(repoRoot, 'i18n', loc, 'dialogs', 'L_projectSettings.ts')
  let text = fs.readFileSync(filePath, 'utf8')
  if (text.includes('saveWithoutClosingButton')) {
    continue
  }
  text = text.replace(
    /(saveButton: '[^']+',)\n/,
    `$1\n  saveWithoutClosingButton: '${label.replace(/'/g, "\\'")}',\n`
  )
  if (!text.includes('saveWithoutClosingButton')) {
    throw new Error(`failed to patch ${filePath}`)
  }
  fs.writeFileSync(filePath, text)
}

console.log('patched saveWithoutClosingButton for', Object.keys(byLocale).length, 'locales')

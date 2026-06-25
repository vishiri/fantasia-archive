export default {
  ariaLabel: 'アプリ構成のインポートまたはエクスポート',
  title: 'アプリ構成のインポート/エクスポート',
  stepper: {
    importPanel: 'インポートするパーツを選択してください',
    rootPanel: '輸入または輸出',
    exportPanel: 'エクスポートするパーツを選択してください',
  },
  importButton: '輸入',
  exportButton: '輸出',
  exportHint: 'エクスポート ファイルに含める設定を選択します',
  importSelectHint: 'ファイルからロードする設定を選択します',
  notice: {
    heading: '以下の点にご注意ください。',
    list: {
      exportFirst: '既存のアプリ設定、アプリのキーバインド、カスタム アプリ CSS、およびアプリ ノートボードを保持したい場合は、まずそれらをエクスポートしてから、置換構成をインポートします。',
      importOverwrites: 'インポートすると、次のステップでの選択に従って、既存のアプリ設定、アプリのキーバインド、カスタム アプリ CSS、およびアプリ ノートボードが上書きされます。',
      selectiveImport: '次の手順でインポートする内容に基づいて、既存の構成の残りの部分を上書きせずに、アプリ構成の 1 つの部分 (アプリ設定、アプリのキーバインド、カスタム アプリ CSS、またはアプリ ノートボード) のみをインポートすることができます。',
    }
  },
  checkboxes: {
    appSettings: 'アプリの設定',
    keybinds: 'アプリのキーバインド',
    appNoteboard: 'アプリのノートボード',
    appStyling: 'カスタムアプリCSS',
  },
  createExportFile: 'エクスポートファイルを作成する',
  importSelected: '選択したインポート',
  toasts: {
    exportSuccess: '設定が正常にエクスポートされました',
    importSuccess: '構成が正常にインポートされました',
  },
  errors: {
    desktopOnly: 'アプリ構成はデスクトップ アプリでのみ使用できます。',
    exportToFileFailed: 'ファイルへのエクスポートに失敗しました',
    importValidationFailed: 'インポートの検証に失敗しました'
  }
}

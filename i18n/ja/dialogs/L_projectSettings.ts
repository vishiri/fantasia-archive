export default {
  title: 'プロジェクト設定',
  closeButton: '保存せずに閉じる',
  saveButton: '設定を保存',
  saveErrors: {
    tooltipIntro: '保存できません。次のエラーが見つかりました:',
    bulletWorldNameRequired: '"{worldLabel}" のワールド名は必須です。',
    bulletDuplicatePalette: '"{worldLabel}" のパレットに重複する色が見つかりました。',
    bulletDocumentTemplateNameRequired: '"{templateLabel}" のドキュメントテンプレート名は必須です。',
    bulletWorldTemplateGroupNameRequired: '"{worldLabel}" のテンプレートグループ名は必須です。',
    bulletWorldTemplateDuplicateDocumentTemplate: '"{worldLabel}" に重複するドキュメントテンプレート "{templateLabel}" があります。'
  },
  singularPluralMissing: {
    bothIntro: '現在の言語の翻訳が不足しています:',
    singularBullet: '単数形がありません',
    pluralBullet: '複数形がありません',
    usingFallback: 'フォールバックを使用: {fallbackLanguageName}'
  },
  categories: {
    generalSettings: {
      title: '一般設定'
    },
    worldsSettings: {
      title: 'ワールド'
    },
    documentTemplatesSettings: {
      title: 'ドキュメントテンプレート'
    }
  },
  fields: {
    projectName: {
      title: 'プロジェクト名',
      label: 'プロジェクト名',
      errorRequired: 'プロジェクト名は必須です。'
    },
    worldName: {
      title: 'ワールド名',
      label: 'ワールド名',
      errorRequired: 'ワールド名は必須です。'
    },
    worldColor: {
      title: '色',
      label: 'ワールドの色',
      tooltip: 'この色は、プロジェクト内のさまざまな場所—アイコン、テキスト、類似の UI—でワールドがどのように表示されるかを決定します。'
    },
    worldColorPalette: {
      label: 'ワールドカラーパレット',
      tooltipIntro: 'カラーパレットでは、後でプロジェクト全体で毎回手動で選ばずに使える色を事前に定義できます。必要に応じてドキュメント間の一貫性を保てます。',
      tooltipRightClickIntro: '個々の色を右クリックすると、追加のアクションが利用できます:',
      tooltipRightClickDeletion: '削除',
      tooltipRightClickDuplication: '複製',
      addButton: '色を追加',
      contextMenu: {
        duplicateColor: '色を複製',
        deleteColor: '色を削除'
      }
    },
    worldTemplateLayout: {
      layoutTitle: 'ワールドの階層ツリー',
      availableTemplatesTitle: '利用可能なドキュメントテンプレート',
      availableTemplatesFilterAriaLabel: '利用可能なドキュメントテンプレートをフィルター',
      availableTemplatesFilterClearAriaLabel: '利用可能なドキュメントテンプレートのフィルターをクリア',
      availableTemplatesFilterPlaceholder: '検索...',
      emptyFilteredAvailableTemplates: '検索に一致するドキュメントテンプレートはありません。',
      addGroupButton: 'グループを追加',
      defaultNewGroupName: '新しいグループ',
      editGroupTooltip: 'グループ名を変更',
      editTemplateTooltip: 'テンプレートのニックネームを調整',
      emptyAvailableTemplates: 'すべてのドキュメントテンプレートがこのワールドに割り当て済みです。',
      groupNameErrorRequired: 'グループ名は必須です。',
      groupRenameInputLabel: 'グループ名',
      placementNicknameHoverOriginalNameLabel: '元の名前',
      placementNicknameHoverNicknameLabel: 'ニックネーム',
      removeGroupTooltip: 'グループを削除',
      removeTemplateTooltip: 'ドキュメントテンプレートを削除',
      templateCanonicalNameLabel: 'ドキュメントテンプレート名',
      templateCanonicalNameTooltip: 'ドキュメントテンプレート全体の名前を正しく変更するには、この編集ダイアログの「ドキュメントテンプレート」セクションで調整してください。',
      templateNicknameLabel: 'このワールド内のニックネーム',
      templateNicknameTooltip: 'ニックネームを設定すると、プロジェクト全体の実名を変えずに、特定のワールド内でドキュメントテンプレートを素早く改名できます。',
      missingGroupDisplayNameTreeTooltip:
        '現在選択されている言語の一部の翻訳が、このグループ名にありません。',
      missingPlacementNicknameTreeTooltip:
        '現在選択されている言語の一部の翻訳が、この配置ニックネームにありません。',
      missingDocumentTemplateTitleTreeTooltip:
        '現在選択されている言語の一部の翻訳が、このドキュメントテンプレートのタイトルにありません。',
      contextMenu: {
        renameGroup: 'グループ名を変更',
        deleteGroup: 'グループを削除'
      },
      renameDialog: {
        title: 'グループ名を変更',
        confirmButton: '名前を変更'
      }
    },
    documentTemplateName: {
      title: 'ドキュメントテンプレート名',
      label: 'ドキュメントテンプレート名',
      errorRequired: 'ドキュメントテンプレートのタイトル翻訳が少なくとも1つ必要です。'
    },
    documentTemplateWorldAppendix: {
      title: 'ワールド付録',
      label: 'ワールド付録',
      tooltip: 'ワールド付録は、個々のワールドと組み合わせたときのドキュメントテンプレートの短く一意な説明です。複数のワールドで同じ名前のテンプレートがある場合の混乱を防ぎます。付録により一目で区別できます。このフィールドはワールドタブでテンプレートをワールドに割り当てるときのみ表示され、他では表示されません。'
    },
    documentTemplateIcon: {
      title: 'アイコン',
      label: 'アイコン'
    }
  },
  panels: {
    worlds: {
      title: 'プロジェクトのワールド',
      addWorldButton: 'ワールドを追加',
      defaultNewWorldName: '新しいワールド',
      deleteWorldButton: 'ワールドを削除',
      emptyFilteredWorlds: '検索に一致するワールドはありません。',
      filterAriaLabel: 'ワールドをフィルター',
      filterClearAriaLabel: 'ワールドのフィルターをクリア',
      filterPlaceholder: '検索...',
      missingTranslationsTabTooltip: '現在選択中の言語の翻訳の一部が、この世界に不足しています。',
      deleteConfirm: {
        confirmDeleteButton: '削除を確認',
        message: 'このワールドを削除してもよろしいですか？リンクされたドキュメントと設定は後から復元できません。永久に失われます。'
      },
      removeDisabledHasDocuments: '削除する前に、このワールドからドキュメントを削除してください。',
      removeDisabledLastWorld: 'プロジェクトには常に少なくとも1つのワールドが必要です。これを削除する前に別のワールドを作成してください。'
    },
    documentTemplates: {
      title: 'ドキュメントテンプレート',
      addFirstTemplateButton: '最初のテンプレートを追加',
      addTemplateButton: 'ドキュメントテンプレートを追加',
      defaultNewTemplateName: '新しいドキュメントテンプレート',
      deleteTemplateButton: 'テンプレートを削除',
      emptyFilteredTemplates: '検索に一致するドキュメントテンプレートはありません。',
      filterAriaLabel: 'ドキュメントテンプレートをフィルター',
      filterClearAriaLabel: 'ドキュメントテンプレートのフィルターをクリア',
      filterPlaceholder: '検索...',
      missingTranslationsTabTooltip: '現在選択中の言語の翻訳の一部が、このドキュメントテンプレートに不足しています。',
      deleteConfirm: {
        confirmDeleteButton: '削除を確認',
        message: 'このドキュメントテンプレートを削除してもよろしいですか？他のテンプレートでこのテンプレートに接続されたすべてのフィールドは動作を停止します。また、このテンプレートで入力された接続ドキュメントはデータの表示を停止します。この削除には意図しない副作用がある場合があります。'
      },
      removeDisabledHasDocuments: '削除する前に、このテンプレートを使用しているドキュメントを削除してください。'
    }
  }
}

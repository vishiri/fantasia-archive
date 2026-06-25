export default {
  title: '项目设置',
  closeButton: '关闭而不保存',
  saveButton: '保存设置',
  saveWithoutClosingButton: '保存而不关闭',
  saveErrors: {
    tooltipIntro: '无法保存。发现以下错误：',
    bulletWorldNameRequired: '“{worldLabel}” 需要世界名称。',
    bulletDuplicatePalette: '在 “{worldLabel}” 的调色板中发现重复颜色。',
    bulletDocumentTemplateNameRequired: '“{templateLabel}” 需要文档模板名称。',
    bulletWorldTemplateGroupNameRequired: '“{worldLabel}” 需要模板组名称。',
    bulletWorldTemplateDuplicateDocumentTemplate: '“{worldLabel}” 中存在重复的文档模板 “{templateLabel}”。'
  },
  singularPluralMissing: {
    bothIntro: '当前语言缺少翻译:',
    singularBullet: '缺少单数形式',
    pluralBullet: '缺少复数形式',
    usingFallback: '使用回退: {fallbackLanguageName}'
  },
  categories: {
    generalSettings: {
      title: '常规设置'
    },
    worldsSettings: {
      title: '世界'
    },
    documentTemplatesSettings: {
      title: '文档模板'
    }
  },
  fields: {
    projectName: {
      title: '项目名称',
      label: '项目名称',
      errorRequired: '项目名称为必填项。'
    },
    worldName: {
      title: '世界名称',
      label: '世界名称',
      errorRequired: '世界名称为必填项。'
    },
    worldColor: {
      title: '颜色',
      label: '世界颜色',
      tooltip: '此颜色决定您的世界在项目各处（图标、文本及类似界面元素）中的显示方式。',
      helpAriaLabel: '世界颜色帮助'
    },
    worldColorPalette: {
      label: '世界调色板',
      tooltipIntro: '调色板可让您预先定义颜色，以便在项目中后续使用，而无需每次都手动选择。在需要时可确保跨文档的一致性。',
      tooltipRightClickIntro: '右键单击单个颜色可使用更多操作：',
      tooltipRightClickDeletion: '删除',
      tooltipRightClickDuplication: '复制',
      addButton: '添加颜色',
      helpAriaLabel: '世界调色板帮助',
      swatchAriaLabel: '编辑色样 {hex}',
      contextMenu: {
        duplicateColor: '复制颜色',
        deleteColor: '删除颜色'
      }
    },
    worldTemplateLayout: {
      layoutTitle: '世界的层级树',
      availableTemplatesTitle: '可用文档模板',
      availableTemplatesFilterAriaLabel: '筛选可用文档模板',
      availableTemplatesFilterClearAriaLabel: '清除可用文档模板筛选',
      availableTemplatesFilterPlaceholder: '搜索...',
      emptyFilteredAvailableTemplates: '没有与搜索匹配的文档模板。',
      addGroupButton: '添加组',
      defaultNewGroupName: '新组',
      editGroupTooltip: '重命名组',
      editTemplateTooltip: '调整模板昵称',
      emptyAvailableTemplates: '所有文档模板已分配给此世界。',
      groupNameErrorRequired: '组名称为必填项。',
      groupRenameInputLabel: '组名称',
      placementNicknameHoverOriginalNameLabel: '原始名称',
      placementNicknameHoverNicknameLabel: '昵称',
      removeGroupTooltip: '移除组',
      removeTemplateTooltip: '移除文档模板',
      templateCanonicalNameLabel: '文档模板名称',
      templateCanonicalNameTooltip: '若要正确重命名整个文档模板，请前往此编辑对话框的“文档模板”部分并在那里调整。',
      templateNicknameLabel: '此世界内的昵称',
      templateNicknameTooltip: '设置昵称可让您在特定世界内快速重命名文档模板，而无需更改整个项目中的真实名称。',
      missingGroupDisplayNameTreeTooltip:
        '当前所选语言的部分翻译在此组名称中缺失。',
      missingPlacementNicknameTreeTooltip:
        '当前所选语言的部分翻译在此放置昵称中缺失。',
      missingDocumentTemplateTitleTreeTooltip:
        '当前所选语言的部分翻译在此文档模板标题中缺失。',
      contextMenu: {
        renameGroup: '重命名组',
        deleteGroup: '删除组'
      },
      renameDialog: {
        title: '重命名组',
        confirmButton: '重命名'
      }
    },
    documentTemplateName: {
      title: '文档模板名称',
      label: '文档模板名称',
      errorRequired: '至少需要一个文档模板标题翻译。'
    },
    documentTemplateWorldAppendix: {
      title: '世界附录',
      label: '世界附录',
      tooltip: '世界附录是文档模板与各个世界配对时的简短唯一描述。当多个世界中的文档模板同名时可避免混淆。附录帮助您一眼区分它们。此字段仅在将模板与世界配对的世界选项卡上显示，其他地方不显示。',
      helpAriaLabel: '世界附录帮助'
    },
    documentTemplateIcon: {
      title: '图标',
      label: '图标'
    }
  },
  panels: {
    worlds: {
      title: '项目的世界',
      addWorldButton: '添加世界',
      defaultNewWorldName: '新世界',
      deleteWorldButton: '删除世界',
      emptyFilteredWorlds: '没有与搜索匹配的世界。',
      filterAriaLabel: '筛选世界',
      filterClearAriaLabel: '清除世界筛选',
      filterPlaceholder: '搜索...',
      missingTranslationsTabTooltip: '当前所选语言的部分翻译在此世界中缺失。',
      deleteConfirm: {
        confirmDeleteButton: '确认删除',
        message: '确定要删除此世界吗？与其关联的文档和设置之后无法恢复。它们将永久丢失。'
      },
      removeDisabledHasDocuments: '删除此世界前，请先移除其中的文档。',
      removeDisabledLastWorld: '项目必须始终至少有一个世界。请先创建另一个世界再删除此世界。'
    },
    documentTemplates: {
      title: '文档模板',
      addFirstTemplateButton: '添加您的第一个模板',
      addTemplateButton: '添加文档模板',
      defaultNewTemplateName: '新文档模板',
      deleteTemplateButton: '删除模板',
      emptyFilteredTemplates: '没有与搜索匹配的文档模板。',
      filterAriaLabel: '筛选文档模板',
      filterClearAriaLabel: '清除文档模板筛选',
      filterPlaceholder: '搜索...',
      missingTranslationsTabTooltip: '当前所选语言的部分翻译在此文档模板中缺失。',
      deleteConfirm: {
        confirmDeleteButton: '确认删除',
        message: '确定要删除此文档模板吗？任何其他模板中连接到此模板的所有字段将停止工作。此外，若曾使用此模板填写，所有关联文档也将停止显示其数据。此删除可能产生意外副作用。'
      },
      removeDisabledHasDocuments: '删除此模板前，请先移除使用此模板的文档。'
    }
  }
}

export default {
  ariaLabel: '导入或导出应用程序配置',
  title: '导入/导出应用程序配置',
  stepper: {
    importPanel: '选择要导入的零件',
    rootPanel: '导入或导出',
    exportPanel: '选择要导出的零件',
  },
  importButton: '进口',
  exportButton: '出口',
  exportHint: '选择要包含在导出文件中的设置',
  importSelectHint: '选择要从文件加载的设置',
  notice: {
    heading: '请注意以下事项：',
    list: {
      exportFirst: '如果您希望保留现有的应用程序设置、应用程序按键绑定、自定义应用程序 CSS 和应用程序记事板，请先导出它们，然后导入替换配置。',
      importOverwrites: '导入将根据您在下一步中的选择覆盖您现有的应用程序设置、应用程序按键绑定、自定义应用程序 CSS 和应用程序笔记本。',
      selectiveImport: '可以仅导入应用程序配置的单个部分（应用程序设置、应用程序按键绑定、自定义应用程序 CSS 或应用程序记事板），而无需根据您在下一步中选择导入的内容覆盖现有配置的其余部分。',
    }
  },
  checkboxes: {
    appSettings: '应用程序设置',
    keybinds: '应用程序按键绑定',
    appNoteboard: '应用记事本',
    appStyling: '自定义应用程序CSS',
  },
  createExportFile: '创建导出文件',
  importSelected: '导入选定的',
  toasts: {
    exportSuccess: '配置成功导出',
    importSuccess: '配置已成功导入',
  },
  errors: {
    desktopOnly: '应用程序配置仅在桌面应用程序中可用。',
    exportToFileFailed: '导出到文件失败',
    importValidationFailed: '导入验证失败'
  }
}

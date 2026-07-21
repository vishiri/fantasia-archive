export default {
  title: 'Fantasia Archive 设置',
  saveButton: '保存设置',
  closeButton: '关闭而不保存',
  settingsSearchPlaceholder: '搜索设置...',
  searchNoResultsTitle: '没有搜索匹配',
  searchNoResultsDescription: '遗憾的是，Fantasia 没有找到您需要的任何设置。也许尝试不同的搜索词？',
  appOptionsCategories: {
    accessibility: {
      title: '无障碍',
      tags: 'a11y，可读性，可视性，辅助性',
      accessibility: {
        subtitle: '无障碍',
        tags: 'a11y，可读性，可视性，辅助性',
      }
    },
    developerSettings: {
      title: '开发者设置',
      tags: '开发人员、调试、诊断、内部',
      documentBody: {
        subtitle: '文件正文',
        tags: '文档 ID、调试元数据、内部字段',
      }
    },
    documentViewEdit: {
      title: '页面：文档查看/编辑',
      tags: '文档页面、查看模式、编辑模式、阅读器',
      documentBody: {
        subtitle: '文件正文',
        tags: '内容区、字段、阅读、编辑区',
      },
    },
    hierarchicalTree: {
      title: '层次树',
      tags: '侧边栏、大纲、导航器、项目树',
      iconSettings: {
        subtitle: '图标设置',
        tags: '操作图标、树按钮、行图标',
      },
      informationDisplaySettings: {
        subtitle: '信息显示设置',
        tags: '计数、数字、订单索引、元数据显示',
      },
      tagSettings: {
        subtitle: '标签设置',
        tags: '标签、标签显示、标签分组',
      },
      treeBehavior: {
        subtitle: '树的行为',
        tags: '展开、折叠、全部展开、交互',
      },
    },

    popupsFloatingWindows: {
      title: '弹出窗口和浮动窗口',
      tags: '对话框、叠加层、模式、窗口',
      floatingWindows: {
        subtitle: '悬浮窗',
        tags: '分离、辅助窗口、多窗口',
      },
      quickSearchDialog: {
        subtitle: 'Quick-search/Quick-add dialog',
        tags: 'quick search, quick add, keyboard search, finder, popup close'
      }
    },
    visualAccessibility: {
      title: '视觉效果和应用程序范围内的功能',
      tags: '外观、界面、全局、ui、外观和感觉',
      applicationExtras: {
        subtitle: '应用附加功能',
        tags: '吉祥物、毛绒玩具、幻想、附加内容',
      },
      appControlBar: {
        subtitle: '应用控制栏',
        tags: '工具栏、顶栏、标题、文档镶边',
      },
      tabBehavior: {
        subtitle: '选项卡行为',
        tags: '切换选项卡、选项卡条、悬停行为',
      },
      visualsAppwideFunctionality: {
        subtitle: '视觉效果和应用程序范围内的功能',
        tags: '主题、镀铬、布局、常规选项',
      }
    },
    projectOverview: {
      title: '页面：项目概览',
      tags: '项目主页, 仪表板, 概览, 工作区',
      projectOverviewBehavior: {
        subtitle: '项目概览行为',
        tags: '提示, 技巧, 你知道吗, 概览卡片',
      }
    },
    welcomeScreen: {
      title: '欢迎屏幕',
      tags: '启动画面、开始屏幕、欢迎、首次启动、主页',
      welcomeScreenBehavior: {
        subtitle: '欢迎屏幕行为',
        tags: '启动技巧、社交链接、入职、启动',
      }
    }
  },
  appOptions: {
    aggressiveRelationshipFilter: {
      title: '积极的关系选择',
      description: '在文档编辑模式下为应用程序中的所有关系搜索打开积极的自动建议模式。如果不打开此功能，过滤后，不会自动选择列表中的第一项。启用此功能会添加此功能 - 允许更方便地选择现有文档，同时在动态创建新文档时牺牲一些便利性。',
      tags: '自动建议、自动完成、第一个匹配、过滤列表、选择现有、关系搜索',
    },
    allowQuickPopupSameKeyClose: {
      title: '使用相同的键关闭快速弹出窗口',
      description: '允许使用打开快速搜索和快速添加弹出窗口时使用的相同组合键来关闭它们。',
      tags: '切换快捷键，相同的热键，快速添加，关闭弹出窗口',
    },
    allowWiderScrollbars: {
      title: '更宽的滚动条',
      description: '此设置使 FA 的滚动条更宽，因此允许在不支持标准滚动的设备（例如没有滚轮的鼠标）上直接手动单击滚动。',
      tags: '滚动条宽度、点击滚动、无滚轮鼠标、轨迹球、触摸',
    },
    disableCategoryCount: {
      title: '隐藏类别数',
      description: '在层次树中隐藏类别编号',
      tags: '简化计数，单一数字，减少混乱',
    },
    compactTags: {
      title: '紧凑型标签',
      description: '确定标签是显示为单个类别还是显示为一个类别（其中每个标签作为一个子类别）。',
      tags: '标签分组、单个标签文件夹、嵌套标签、标签层次结构',
    },
    darkMode: {
      title: '深色模式',
      description: '在应用程序的浅色和深色模式之间切换。',
      tags: '深色、浅色、主题、主题、颜色、颜色',
    },
    disableCloseAfterSelectQuickSearch: {
      title: '选择后停止关闭',
      description: '通常，快速搜索会在从中选择项目后关闭。启用此功能可以防止这种行为，从而允许您依次打开多个搜索结果。',
      tags: '保持打开、多个结果、批量打开、快速搜索保持打开',
    },
    disableAppControlBar: {
      title: '禁用应用控制栏',
      description: '如果您想最大化文档上的工作空间，可以使用此设置禁用顶部按钮栏。必要的控制按钮将被移动到主文档正文的顶部，而其余功能将通过按键绑定或通过左上角的应用程序菜单访问。',
      tags: '工具栏隐藏、最大化空间、全宽、文档标题',
    },
    disableAppControlBarContentButtons: {
      title: 'Disable app control bar content buttons',
      description: 'Toggles the project contents (document search, document creation, etc.) on the app control bar on or off.',
      tags: 'quick search, quick add, document create, content tools, control bar buttons'
    },
    disableAppControlBarFunctionButtons: {
      title: 'Disable app control bar function buttons',
      description: 'Toggles the app functional buttons (noteboards, hierarchical tree toggling, etc.) on the app control bar on or off.',
      tags: 'noteboard, tree toggle, sidebar hide, function tools, control bar buttons'
    },
    disableAppControlBarGuides: {
      title: '禁用应用控制栏指南',
      description: '打开或关闭应用控制栏上的新手友好指南。',
      tags: '初学者提示、教程横幅、指导标记、控制栏帮助',
    },
    disableDocumentCounts: {
      title: '隐藏文档计数',
      description: '在层次树中隐藏文档编号',
      tags: '总计关闭，无计数，统计信息隐藏',
    },
    disableDocumentToolTips: {
      title: '禁用文档工具提示',
      description: '如果您不喜欢文档视图工具提示，可以在此处全局关闭它们。',
      tags: '悬停文本、字段帮助、弹出窗口、文档视图提示',
    },
    disableQuickSearchCategoryPrecheck: {
      title: '不要预先检查类别过滤器',
      description: '通常，类别包含在快速搜索中。启用此选项可逆转该行为。',
      tags: '类别过滤器，搜索范围，包括类别，默认过滤器',
    },
    disableSpellCheck: {
      title: '禁用拼写检查',
      description: '在文档编辑模式下禁用拼写、语法和单词检查。',
      tags: '拼写、语法、校对、红色下划线、写作、词典',
      note: '需要完全重启应用程序才能生效！',
    },

    doubleDashDocCount: {
      title: '明显的计数分隔符',
      description: '此设置在分层树中的类别和文档计数之间添加另一个 \\\\| 字符。',
      tags: '管道、分隔符、分隔符、计数格式、树计数',
    },
    forceSublevelCollapseInTree: {
      title: 'Force sublevel collapse in the tree',
      description: 'Forces sublevels of the closed node in the hierarchical tree to close as well when a parent node is closed. Normally, they remember the pre-close state and will reopen as they were when closed.',
      tags: 'force collapse, close children, parent node, nested tree, remember expand'
    },
    hideAdvSearchCheatsheetButton: {
      title: '隐藏关系帮助按钮',
      description: '隐藏关系类型字段中的高级搜索备忘单帮助按钮。',
      tags: '关系字段、备忘单、帮助图标、链接选择器、高级搜索',
    },
    hideDeadCrossThrough: {
      title: '隐藏删除线',
      description: '此设置隐藏已失效、消失或损坏的文档的删除线效果，以提高可见性。',
      tags: '删除线、已故、被毁坏、消失、文件状态、划掉',
    },
    hideDocumentTitles: {
      title: '隐藏文档标题',
      description: '隐藏文档视图中的大节标题。请注意，这可能会导致相对较大的布局变化，在某些情况下可能会使文档看起来不规则。',
      tags: '章节标题、字段组、文档结构标签',
    },
    hideEmptyFields: {
      title: '隐藏空字段',
      description: '在查看（非编辑）模式下隐藏未填写任何值的字段。请注意，这可能会导致相对较大的布局变化，在某些情况下可能会使文档看起来不规则。',
      tags: '空白字段、只读视图、紧凑文档、布局转换',
    },
    hideHierarchyTree: {
      title: 'Hide hierarchical tree',
      description: 'Controls whether the hierarchical tree is shown.',
      tags: 'sidebar off, navigator hidden, tree panel, outline hide'
    },
    hidePlushes: {
      title: '隐藏幻想曲吉祥物',
      description: '隐藏着令人惊叹的可爱和令人敬畏的幻想曲，小奥术龙。你怎么可以！ :(',
      tags: '龙，吉祥物，毛绒，人物，装饰，复活节彩蛋',
    },
    hideTooltipsProject: {
      title: '隐藏项目概述的提示',
      description: '隐藏项目概述提示和技巧信息卡。',
      tags: '项目主页、仪表板卡、概述提示',
    },
    hideTooltipsStart: {
      title: '隐藏开始屏幕上弹出的提示',
      description: '隐藏开始屏幕提示和技巧弹出窗口。',
      tags: '首次启动、入职、启动、启动提示、技巧',
    },
    hideTreeIconAddUnder: {
      title: '隐藏“添加到”图标',
      description: '此选项隐藏“在所选父级下添加新文档”图标。',
      tags: '添加子项、在下面新建、在下面添加、在下面创建',
    },
    hideTreeIconEdit: {
      title: '隐藏“编辑”图标',
      description: '此选项隐藏行编辑图标。',
      tags: '铅笔图标，编辑行，快速编辑树',
    },
    hideTreeIconView: {
      title: '隐藏“打开”图标',
      description: '此选项隐藏行打开图标。',
      tags: '打开图标，转到文档，行打开按钮',
    },
    hideTreeLines: {
      title: 'Hide tree lines',
      description: 'Hides the structural help-lines in the hierarchy tree.',
      tags: 'lines, helplines, structure, tree, hierarchical, hierarchical tree'
    },
    hideTreeOrderNumbers: {
      title: '隐藏订单号',
      description: '将自定义订单号隐藏在名称左侧。',
      tags: '序列索引、手动顺序、排名前缀、左装订线',
    },
    hideRecentProjectTooltip: {
      title: '隐藏“浏览最新项目”工具提示',
      description: '隐藏欢迎屏幕上恢复最新项目旁边的浏览最新项目插入符号上的工具提示。',
      tags: '项目、加载、加载、最新、最近、介绍、开始、欢迎、工具提示、弹出窗口、工具提示、弹出窗口',
    },
    hideWelcomeScreenSocials: {
      title: '隐藏欢迎屏幕社交链接',
      description: '隐藏欢迎屏幕上的所有社交链接。',
      tags: '不和谐、推特、社区链接、社交媒体、欢迎',
    },
    skipWelcomeScreen: {
      title: '跳过欢迎屏幕',
      description: '启动应用程序时跳过欢迎屏幕并尝试直接加载最新项目。',
      tags: '项目、加载、加载、最新、最近、介绍、开始、欢迎',
    },
    invertCategoryPosition: {
      title: '反转类别位置',
      description: '切换类别和文档编号的位置。',
      tags: '交换编号、计数顺序、类别与文档计数',
    },
    limitEditorHeight: {
      title: '限制文本编辑器高度',
      description: '确定文本编辑器在非全屏模式下是否有高度限制。',
      tags: '文本区域高度、长文本、展开编辑器、滚动编辑器',
    },
    logFullActivityPayload: {
      title: '记录完整活动负载',
      description: '如果启用此功能，活动将在所有情况下记录完整的有效负载（通常仅在非错误和非警告情况下记录）。当进行需要精确记录结果的深度调试时，这非常有用。',
      tags: '调试、故障排除、DevTools、负载、活动、日志',
    },
    noProjectName: {
      title: '在树中隐藏项目名称',
      description: '确定项目名称是否完全显示在层次结构树中。',
      tags: '根标签、项目标题树、标题隐藏',
    },
    noTags: {
      title: '隐藏树中的标签',
      description: '确定标签是否完全显示在分层树中。',
      tags: '标签关闭、标签条、树标签、隐藏标签',
    },
    preventAutoScroll: {
      title: '防止自动滚动',
      description: '确定文档在文档之间切换时是否重新调用其滚动位置并自动滚动。',
      tags: '滚动位置、记住滚动、跳转到顶部、选项卡切换',
    },
    preventFilledAppNoteBoardPopup: {
      title: 'Prevent filled app noteboard from showing',
      description: 'When enabled, the app noteboard will not open automatically at app start when it still contains notes from previous FA sessions.',
      tags: 'app noteboard, sticky notes, startup, auto open, reminders'
    },
    preventFilledProjectNoteBoardPopup: {
      title: 'Prevent filled project noteboard from showing',
      description: 'When enabled, the project noteboard will not open automatically when a project loads if it still contains notes from previous project sessions.',
      tags: 'project noteboard, sticky notes, project open, auto open, reminders'
    },

    preventPreviewsDocuments: {
      title: '防止文档预览',
      description: '控制是否在文档视图和关系字段中显示悬停时的快速预览。',
      tags: '悬停卡、查看、关系弹出窗口、内联预览',
    },
    preventPreviewsPopups: {
      title: '防止在对话框中预览文档',
      description: '控制在对话框（例如现有文档选择器）中选择文档时是否显示悬停快速预览。',
      tags: '现有文档对话框、选择器悬停、文档选择器、模式预览',
    },
    preventPreviewsTabs: {
      title: '防止在选项卡上预览文档',
      description: '控制是否在选项卡栏中的文档选项卡上显示悬停时的快速预览。',
      tags: '选项卡悬停、选项卡条预览、标题栏预览',
    },
    preventPreviewsTree: {
      title: '防止悬停时预览文档',
      description: '控制悬停时的快速预览是否显示在分层树中。当悬停预览保持启用状态时，它们会对应用程序性能产生重大影响。',
      tags: '树悬停、滞后、缓慢、fps、性能、侧边栏预览',
      note: '会对应用程序性能产生重大影响！',
    },
    showDocumentID: {
      title: '显示文档 ID',
      description: '如果启用此功能，文档正文还将显示内部文档 ID 值。',
      tags: '调试、内部 ID、标识符、开发工具、故障排除',
    },
    tagsAtTop: {
      title: '树中的顶部标签',
      description: '在层次树的顶部显示标签。',
      tags: '标签顺序，标签优先，类别之上',
    },
    textShadow: {
      title: '文字阴影',
      description: '此设置可切换分层树、关系搜索弹出窗口和选项卡中的文本阴影，从而使文本在背景下看起来更加突出。',
      tags: '对比度、易读性、阴影、轮廓、可读性、文本清晰度',
    }
  }
}

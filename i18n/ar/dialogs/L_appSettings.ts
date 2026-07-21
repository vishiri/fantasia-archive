export default {
  title: 'Fantasia Archive الإعدادات',
  saveButton: 'حفظ الإعدادات',
  closeButton: 'إغلاق بدون حفظ',
  settingsSearchPlaceholder: 'بحث في الإعدادات...',
  searchNoResultsTitle: 'لا يوجد تطابق في البحث',
  searchNoResultsDescription: 'Fantasia للأسف لم تجد أي إعدادات كنت تبحث عنها. ربما حاول استخدام مصطلح بحث مختلف؟',
  appOptionsCategories: {
    accessibility: {
      title: 'إمكانية الوصول',
      tags: 'a11y، سهولة القراءة، الرؤية، المساعدة',
      accessibility: {
        subtitle: 'إمكانية الوصول',
        tags: 'a11y، سهولة القراءة، الرؤية، المساعدة',
      }
    },
    developerSettings: {
      title: 'إعدادات المطور',
      tags: 'المطور، التصحيح، التشخيص، داخلي',
      documentBody: {
        subtitle: 'جسم الوثيقة',
        tags: 'معرف المستند، تصحيح بيانات التعريف، الحقول الداخلية',
      }
    },
    documentViewEdit: {
      title: 'صفحة: عرض/تحرير المستند',
      tags: 'صفحة المستند، وضع العرض، وضع التحرير، القارئ',
      documentBody: {
        subtitle: 'جسم الوثيقة',
        tags: 'منطقة المحتوى، الحقول، القراءة، منطقة المحرر',
      },
    },
    hierarchicalTree: {
      title: 'شجرة هرمية',
      tags: 'الشريط الجانبي، المخطط التفصيلي، المستكشف، شجرة المشروع',
      iconSettings: {
        subtitle: 'إعدادات الأيقونة',
        tags: 'أيقونات العمل، أزرار الشجرة، أيقونات الصف',
      },
      informationDisplaySettings: {
        subtitle: 'إعدادات عرض المعلومات',
        tags: 'التعدادات والأرقام وفهرس الطلب وعرض البيانات الوصفية',
      },
      tagSettings: {
        subtitle: 'إعدادات العلامة',
        tags: 'التسميات، عرض العلامات، تجميع العلامات',
      },
      treeBehavior: {
        subtitle: 'سلوك الشجرة',
        tags: 'توسيع، انهيار، توسيع الكل، التفاعل',
      },
    },

    popupsFloatingWindows: {
      title: 'النوافذ المنبثقة والنوافذ العائمة',
      tags: 'مربعات الحوار، والتراكبات، والمشروط، والنوافذ',
      floatingWindows: {
        subtitle: 'النوافذ العائمة',
        tags: 'فصل، نافذة ثانوية، نافذة متعددة',
      },
      quickSearchDialog: {
        subtitle: 'Quick-search/Quick-add dialog',
        tags: 'quick search, quick add, keyboard search, finder, popup close'
      }
    },
    visualAccessibility: {
      title: 'المرئيات والوظائف على مستوى التطبيق',
      tags: 'المظهر، الواجهة، العالمية، واجهة المستخدم، الشكل والمظهر',
      applicationExtras: {
        subtitle: 'إضافات التطبيق',
        tags: 'التميمة، القطيفة، فانتازيا، الإضافات',
      },
      appControlBar: {
        subtitle: 'شريط التحكم بالتطبيق',
        tags: 'شريط الأدوات، الشريط العلوي، الرأس، وثيقة الكروم',
      },
      tabBehavior: {
        subtitle: 'سلوك علامة التبويب',
        tags: 'تبديل علامات التبويب، وشريط علامات التبويب، وسلوك التمرير',
      },
      visualsAppwideFunctionality: {
        subtitle: 'المرئيات والوظائف على مستوى التطبيق',
        tags: 'الموضوع، الكروم، التخطيط، الخيارات العامة',
      }
    },
    projectOverview: {
      title: 'صفحة: نظرة عامة على المشروع',
      tags: 'الصفحة الرئيسية للمشروع، لوحة المعلومات، نظرة عامة، مساحة العمل',
      projectOverviewBehavior: {
        subtitle: 'سلوك نظرة عامة على المشروع',
        tags: 'نصائح، حيل، هل تعلم، بطاقة النظرة العامة',
      }
    },
    welcomeScreen: {
      title: 'شاشة الترحيب',
      tags: 'البداية، شاشة البداية، الترحيب، الإطلاق الأول، الصفحة الرئيسية',
      welcomeScreenBehavior: {
        subtitle: 'سلوك شاشة الترحيب',
        tags: 'نصائح لبدء التشغيل، روابط اجتماعية، الإعداد، البداية',
      }
    }
  },
  appOptions: {
    aggressiveRelationshipFilter: {
      title: 'اختيار العلاقات العدوانية',
      description: 'يقوم بتشغيل وضع الاقتراح التلقائي القوي لجميع عمليات البحث عن العلاقات عبر التطبيق في وضع تحرير المستند. بدون تشغيل هذا، بعد التصفية، لا يتم تحديد العنصر الأول في القائمة تلقائيًا. يؤدي تشغيل هذا إلى إضافة هذه الوظيفة، مما يسمح بتحديد أكثر ملاءمة للمستندات الموجودة مع التضحية ببعض الراحة عند إنشاء مستندات جديدة بسرعة.',
      tags: 'الاقتراح التلقائي، الإكمال التلقائي، المطابقة الأولى، قائمة التصفية، اختيار القائمة، البحث عن العلاقة',
    },
    allowQuickPopupSameKeyClose: {
      title: 'أغلق النوافذ المنبثقة السريعة بنفس المفتاح',
      description: 'يسمح بإغلاق نوافذ البحث السريع والإضافة السريعة المنبثقة بنفس مجموعة المفاتيح التي تم استخدامها لفتحها.',
      tags: 'تبديل الاختصار، نفس مفتاح التشغيل السريع، الإضافة السريعة، رفض النافذة المنبثقة',
    },
    allowWiderScrollbars: {
      title: 'أشرطة تمرير أوسع',
      description: 'يعمل هذا الإعداد على جعل أشرطة التمرير الخاصة بـ FA أوسع، وبالتالي يسمح بالتمرير اليدوي بالنقر عليها مباشرةً للأجهزة التي لا تدعم التمرير القياسي (على سبيل المثال، أجهزة الماوس التي لا تحتوي على عجلة تمرير).',
      tags: 'عرض شريط التمرير، انقر فوق التمرير، الماوس بدون عجلة، كرة التتبع، اللمس',
    },
    disableCategoryCount: {
      title: 'إخفاء عدد الفئات',
      description: 'إخفاء أرقام الفئات في الشجرة الهرمية',
      tags: 'العد المبسط، رقم واحد، فوضى أقل',
    },
    compactTags: {
      title: 'العلامات المدمجة',
      description: 'يحدد ما إذا كانت العلامات سيتم عرضها كفئات فردية أو كفئة واحدة مع كل علامة كفئة فرعية.',
      tags: 'تجميع العلامات، مجلد علامات واحد، علامات متداخلة، التسلسل الهرمي للعلامات',
    },
    darkMode: {
      title: 'الوضع المظلم',
      description: 'التبديل بين الوضع الفاتح والداكن للتطبيق.',
      tags: 'الظلام والضوء والموضوع والموضوعات واللون والألوان',
    },
    disableCloseAfterSelectQuickSearch: {
      title: 'توقف عن الإغلاق بعد التحديد',
      description: 'عادةً ما يتم إغلاق البحث السريع بعد تحديد عنصر منه. يؤدي تشغيل هذه الميزة إلى منع هذا السلوك، مما يسمح لك بفتح نتائج بحث متعددة واحدة تلو الأخرى.',
      tags: 'إبقاء مفتوحة، نتائج متعددة، دفعة مفتوحة، يبقى البحث السريع مفتوحا',
    },
    disableAppControlBar: {
      title: 'تعطيل شريط التحكم بالتطبيق',
      description: 'إذا كنت تريد زيادة مساحة العمل الخاصة بك على المستند إلى الحد الأقصى، فيمكنك تعطيل شريط الأزرار العلوي باستخدام هذا الإعداد. سيتم نقل أزرار التحكم الضرورية إلى الجزء العلوي من نص المستند الرئيسي، بينما يمكن الوصول إلى بقية الوظائف عبر روابط المفاتيح أو من خلال قائمة التطبيق في الجزء العلوي الأيسر.',
      tags: 'إخفاء شريط الأدوات، زيادة المساحة، العرض الكامل، رأس المستند',
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
      title: 'تعطيل أدلة شريط التحكم بالتطبيق',
      description: 'تبديل الأدلة الملائمة للمبتدئين في شريط التحكم بالتطبيق بين التشغيل أو الإيقاف.',
      tags: 'تلميحات للمبتدئين، لافتات تعليمية، علامات المدرب، تعليمات شريط التحكم',
    },
    disableDocumentCounts: {
      title: 'إخفاء عدد المستندات',
      description: 'إخفاء أرقام المستندات في الشجرة الهرمية',
      tags: 'إجماليات قبالة، لا تهم، إخفاء الإحصائيات',
    },
    disableDocumentToolTips: {
      title: 'تعطيل تلميحات أدوات المستند',
      description: 'إذا لم تعجبك تلميحات أدوات عرض المستندات، فيمكنك إيقاف تشغيلها عالميًا هنا.',
      tags: 'نص التحويم، المساعدة الميدانية، النافذة المنبثقة، تلميحات عرض المستند',
    },
    disableQuickSearchCategoryPrecheck: {
      title: 'لا تقم بالتحقق مسبقًا من مرشح الفئة',
      description: 'عادة، يتم تضمين الفئات في البحث السريع. يؤدي تمكين هذا الخيار إلى عكس هذا السلوك.',
      tags: 'مرشح الفئة، نطاق البحث، تضمين الفئات، عامل التصفية الافتراضي',
    },
    disableSpellCheck: {
      title: 'تعطيل التدقيق الإملائي',
      description: 'تعطيل التدقيق الإملائي والنحوي والكلمات في وضع تحرير المستند.',
      tags: 'التدقيق الإملائي، النحوي، التدقيق، التسطير الأحمر، الكتابة، القاموس',
      note: 'يحتاج إلى إعادة تشغيل التطبيق بالكامل ليصبح ساري المفعول!',
    },

    doubleDashDocCount: {
      title: 'مقسم العد الواضح',
      description: 'يضيف هذا الإعداد حرف \\\\| آخر بين الفئة وعدد المستندات في الشجرة الهرمية.',
      tags: 'الأنبوب، المحدد، الفاصل، تنسيق العد، عدد الأشجار',
    },

    forceSublevelCollapseInTree: {
      title: 'Force sublevel collapse in the tree',
      description: 'Forces sublevels of the closed node in the hierarchical tree to close as well when a parent node is closed. Normally, they remember the pre-close state and will reopen as they were when closed.',
      tags: 'force collapse, close children, parent node, nested tree, remember expand'
    },
    hideAdvSearchCheatsheetButton: {
      title: 'إخفاء زر مساعدة العلاقات',
      description: 'يخفي زر تعليمات ورقة الغش للبحث المتقدم في حقول نوع العلاقة.',
      tags: 'مجال العلاقة، ورقة الغش، أيقونة المساعدة، منتقي الروابط، البحث المتقدم',
    },
    hideDeadCrossThrough: {
      title: 'إخفاء الإضراب',
      description: 'يخفي هذا الإعداد تأثير الشطب على المستندات الميتة أو المفقودة أو المدمرة من أجل زيادة الرؤية.',
      tags: 'يتوسطه خط، متوفى، مدمر، اختفى، حالة الوثيقة، مشطوب',
    },
    hideDocumentTitles: {
      title: 'إخفاء عناوين المستندات',
      description: 'إخفاء عناوين الأقسام الكبيرة في عرض المستند. يرجى ملاحظة أن هذا قد يؤدي إلى تغييرات كبيرة في التخطيط نسبيًا، مما قد يجعل المستند يبدو جامحًا في بعض الحالات.',
      tags: 'عناوين الأقسام، ومجموعات الحقول، وتسميات هيكل الوثيقة',
    },
    hideEmptyFields: {
      title: 'إخفاء الحقول الفارغة',
      description: 'إخفاء الحقول بدون أي قيمة مملوءة، في وضع العرض (بدون تحرير). يرجى ملاحظة أن هذا قد يؤدي إلى تغييرات كبيرة في التخطيط نسبيًا، مما قد يجعل المستند يبدو جامحًا في بعض الحالات.',
      tags: 'الحقول الفارغة، عرض للقراءة فقط، مستند مضغوط، تغيير التخطيط',
    },
    hideHierarchyTree: {
      title: 'Hide hierarchical tree',
      description: 'Controls whether the hierarchical tree is shown.',
      tags: 'sidebar off, navigator hidden, tree panel, outline hide'
    },
    hidePlushes: {
      title: 'إخفاء التميمة فانتازيا',
      description: 'يخفي فانتازيا الرائعة والرائعة بشكل مثير للدهشة، التنين الغامض الصغير. كيف يمكنك! :(',
      tags: 'التنين، التميمة، القطيفة، الشخصية، الديكور، بيضة عيد الفصح',
    },
    hideTooltipsProject: {
      title: 'إخفاء النصائح حول نظرة عامة على المشروع',
      description: 'يخفي بطاقة معلومات النصائح والحيل الخاصة بالمشروع.',
      tags: 'الصفحة الرئيسية للمشروع، بطاقة لوحة القيادة، تلميحات عامة',
    },
    hideTooltipsStart: {
      title: 'إخفاء النصائح المنبثقة على شاشة البداية',
      description: 'يخفي النصائح والحيل المنبثقة لشاشة البداية.',
      tags: 'الإطلاق الأول، الإعداد، البداية، نصائح بدء التشغيل، الحيل',
    },
    hideTreeIconAddUnder: {
      title: 'إخفاء أيقونة "إضافة تحت".',
      description: 'يخفي هذا الخيار أيقونة "إضافة مستند جديد ضمن الأصل المحدد".',
      tags: 'إضافة طفل، جديد تحت، زائد تحت، إنشاء أدناه',
    },
    hideTreeIconEdit: {
      title: 'إخفاء أيقونة "تحرير".',
      description: 'يخفي هذا الخيار أيقونة تحرير الصف.',
      tags: 'رمز القلم الرصاص، تحرير الصف، شجرة التحرير السريع',
    },
    hideTreeIconView: {
      title: 'إخفاء أيقونة "فتح".',
      description: 'يخفي هذا الخيار أيقونة فتح الصف.',
      tags: 'رمز فتح، انتقل إلى المستند، زر فتح الصف',
    },
    hideTreeLines: {
      title: 'Hide tree lines',
      description: 'Hides the structural help-lines in the hierarchy tree.',
      tags: 'lines, helplines, structure, tree, hierarchical, hierarchical tree'
    },
    hideTreeOrderNumbers: {
      title: 'إخفاء أرقام الطلب',
      description: 'إخفاء أرقام الطلب المخصصة على يسار الأسماء.',
      tags: 'مؤشر التسلسل، الترتيب اليدوي، بادئة الرتبة، الحضيض الأيسر',
    },
    hideRecentProjectTooltip: {
      title: 'إخفاء تلميح أداة "تصفح أحدث المشاريع".',
      description: 'يخفي تلميح الأداة الموجود في علامة إقحام تصفح أحدث المشاريع بجانب استئناف أحدث مشروع على شاشة الترحيب.',
      tags: 'مشروع، تحميل، جارٍ التحميل، الأحدث، الأخير، مقدمة، بداية، ترحيب، تلميح أداة، نافذة منبثقة، تلميحات أدوات، نافذة منبثقة',
    },
    hideWelcomeScreenSocials: {
      title: 'إخفاء الروابط الاجتماعية لشاشة الترحيب',
      description: 'يخفي جميع الروابط الاجتماعية على شاشة الترحيب.',
      tags: 'الخلاف، تويتر، روابط المجتمع، وسائل التواصل الاجتماعي، مرحبا بكم',
    },
    skipWelcomeScreen: {
      title: 'تخطي شاشة الترحيب',
      description: 'يتخطى شاشة الترحيب ويحاول تحميل أحدث مشروع مباشرة عند تشغيل التطبيق.',
      tags: 'مشروع، تحميل، تحميل، الأحدث، الأخير، مقدمة، بداية، مرحبًا',
    },
    invertCategoryPosition: {
      title: 'عكس موضع الفئة',
      description: 'يقوم بتبديل مواضع الفئة وأرقام المستندات.',
      tags: 'أرقام المبادلة، ترتيب العد، فئة مقابل عدد الوثائق',
    },
    limitEditorHeight: {
      title: 'الحد من ارتفاع محرر النص',
      description: 'يحدد ما إذا كان محرر النصوص له ارتفاع محدود عندما لا يكون في وضع ملء الشاشة.',
      tags: 'ارتفاع منطقة النص، النص الطويل، محرر التوسيع، محرر التمرير',
    },
    logFullActivityPayload: {
      title: 'تسجيل حمولة النشاط الكاملة',
      description: 'إذا تم تمكين هذا، فسيقوم النشاط بتسجيل الحمولات الكاملة في جميع المواقف (عادةً ما يتم تسجيله فقط في المواقف التي لا تحتوي على أخطاء أو حالات عدم التحذير). يمكن أن يكون هذا مفيدًا عند إجراء التصحيح العميق الذي يحتاج إلى تسجيل دقيق للنتائج.',
      tags: 'تصحيح، استكشاف الأخطاء، أدوات المطور، حمولة، نشاط، تسجيل',
    },
    noProjectName: {
      title: 'إخفاء اسم المشروع في الشجرة',
      description: 'يحدد ما إذا كان اسم المشروع سيظهر في الشجرة الهرمية على الإطلاق.',
      tags: 'تسمية الجذر، شجرة عنوان المشروع، إخفاء الرأس',
    },
    noTags: {
      title: 'إخفاء العلامات في الشجرة',
      description: 'يحدد ما إذا كانت العلامات ستظهر في الشجرة الهرمية على الإطلاق.',
      tags: 'إيقاف التسميات، وشريط العلامات، وتسميات الشجرة، وإخفاء التسميات',
    },
    preventAutoScroll: {
      title: 'منع التمرير التلقائي',
      description: 'يحدد ما إذا كانت المستندات تتذكر مواضع التمرير الخاصة بها وتقوم بالتمرير التلقائي عند التبديل بينها.',
      tags: 'موضع التمرير، تذكر التمرير، انتقل إلى الأعلى، مفتاح علامة التبويب',
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
      title: 'منع معاينات المستندات',
      description: 'يتحكم في ما إذا كانت المعاينة السريعة عند التمرير ستظهر في عرض المستند وفي حقول العلاقات.',
      tags: 'بطاقة التمرير، نظرة خاطفة، العلاقة المنبثقة، المعاينة المضمنة',
    },
    preventPreviewsPopups: {
      title: 'منع معاينات المستندات في مربعات الحوار',
      description: 'يتحكم في ما إذا كانت المعاينة السريعة عند التمرير تظهر عند تحديد المستندات في مربعات الحوار (على سبيل المثال، منتقي المستندات الموجود).',
      tags: 'مربع حوار المستند الحالي، والتمرير فوق المنتقي، ومنتقي المستندات، والمعاينة المشروطة',
    },
    preventPreviewsTabs: {
      title: 'منع معاينات المستندات على علامات التبويب',
      description: 'يتحكم في ما إذا كانت المعاينة السريعة عند التمرير تظهر على علامات تبويب المستندات في شريط علامات التبويب.',
      tags: 'تمرير علامة التبويب، معاينة شريط علامات التبويب، نظرة خاطفة على شريط العنوان',
    },
    preventPreviewsTree: {
      title: 'منع معاينات المستند عند التمرير',
      description: 'يتحكم في ما إذا كانت المعاينة السريعة عند التمرير ستظهر في الشجرة الهرمية. عندما تظل معاينات التمرير ممكنة، يمكن أن يكون لها تأثير كبير على أداء التطبيق.',
      tags: 'تحويم الشجرة، التأخر، البطيء، الإطارات في الثانية، الأداء، معاينة الشريط الجانبي',
      note: 'يمكن أن يكون لها تأثير كبير على أداء التطبيق!',
    },
    showDocumentID: {
      title: 'إظهار معرفات المستندات',
      description: 'إذا تم تمكين هذا، فسيعرض نص المستند أيضًا قيمة معرف المستند الداخلي.',
      tags: 'التصحيح، المعرف الداخلي، المعرف، أدوات التطوير، استكشاف الأخطاء وإصلاحها',
    },
    tagsAtTop: {
      title: 'أعلى العلامات في الشجرة',
      description: 'إظهار العلامات في أعلى الشجرة الهرمية.',
      tags: 'ترتيب العلامات، العلامات أولاً، الفئات أعلاه',
    },
    textShadow: {
      title: 'ظل النص',
      description: 'يقوم هذا الإعداد بتبديل ظلال النص في الشجرة الهرمية، والنوافذ المنبثقة للبحث عن العلاقات، وعلامات التبويب، مما يسمح بإلقاء نظرة أكثر وضوحًا على النص في الخلفية.',
      tags: 'التباين، الوضوح، الظل، الخطوط العريضة، سهولة القراءة، وضوح النص',
    }
  }
}

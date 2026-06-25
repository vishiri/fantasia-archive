export default {
  title: 'إعدادات المشروع',
  closeButton: 'إغلاق بدون حفظ',
  saveButton: 'حفظ الإعدادات',
  saveWithoutClosingButton: 'حفظ دون إغلاق',
  saveErrors: {
    tooltipIntro: 'تعذر الحفظ. تم العثور على الأخطاء التالية:',
    bulletWorldNameRequired: 'اسم العالم مطلوب لـ "{worldLabel}".',
    bulletDuplicatePalette: 'تم العثور على ألوان مكررة في لوحة ألوان "{worldLabel}".',
    bulletDocumentTemplateNameRequired: 'اسم قالب المستند مطلوب لـ "{templateLabel}".',
    bulletWorldTemplateGroupNameRequired: 'اسم مجموعة القالب مطلوب لـ "{worldLabel}".',
    bulletWorldTemplateDuplicateDocumentTemplate: 'قالب مستند مكرر "{templateLabel}" في "{worldLabel}".'
  },
  singularPluralMissing: {
    bothIntro: 'ترجمات مفقودة للغة الحالية:',
    singularBullet: 'صيغة المفرد مفقودة',
    pluralBullet: 'صيغة الجمع مفقودة',
    usingFallback: 'يتم استخدام البديل: {fallbackLanguageName}'
  },
  categories: {
    generalSettings: {
      title: 'الإعدادات العامة'
    },
    worldsSettings: {
      title: 'العوالم'
    },
    documentTemplatesSettings: {
      title: 'قوالب المستندات'
    }
  },
  fields: {
    projectName: {
      title: 'اسم المشروع',
      label: 'اسم المشروع',
      errorRequired: 'اسم المشروع مطلوب.'
    },
    worldName: {
      title: 'اسم العالم',
      label: 'اسم العالم',
      errorRequired: 'اسم العالم مطلوب.'
    },
    worldColor: {
      title: 'اللون',
      label: 'لون العالم',
      tooltip: 'يحدد هذا اللون كيف يظهر عالمك في مختلف أماكن المشروع—الأيقونات والنص وعناصر واجهة المستخدم المماثلة.',
      helpAriaLabel: 'مساعدة حول لون العالم'
    },
    worldColorPalette: {
      label: 'لوحة ألوان العالم',
      tooltipIntro: 'تتيح لك لوحة الألوان تحديد ألوان مسبقًا لاستخدامها لاحقًا في المشروع دون الحاجة لاختيارها يدويًا في كل مرة. يتيح ذلك الاتساق بين المستندات عند الحاجة.',
      tooltipRightClickIntro: 'مزيد من الإجراءات متاحة عند النقر بالزر الأيمن على ألوان فردية:',
      tooltipRightClickDeletion: 'حذف',
      tooltipRightClickDuplication: 'تكرار',
      addButton: 'إضافة لون',
      helpAriaLabel: 'مساعدة حول لوحة ألوان العالم',
      swatchAriaLabel: 'تحرير عينة اللون {hex}',
      contextMenu: {
        duplicateColor: 'تكرار اللون',
        deleteColor: 'حذف اللون'
      }
    },
    worldTemplateLayout: {
      layoutTitle: 'الشجرة الهرمية للعالم',
      availableTemplatesTitle: 'قوالب المستندات المتاحة',
      availableTemplatesFilterAriaLabel: 'تصفية قوالب المستندات المتاحة',
      availableTemplatesFilterClearAriaLabel: 'مسح تصفية قوالب المستندات المتاحة',
      availableTemplatesFilterPlaceholder: 'بحث...',
      emptyFilteredAvailableTemplates: 'لا توجد قوالب مستندات تطابق بحثك.',
      addGroupButton: 'إضافة مجموعة',
      defaultNewGroupName: 'مجموعة جديدة',
      editGroupTooltip: 'إعادة تسمية المجموعة',
      editTemplateTooltip: 'ضبط الاسم المستعار للقالب',
      emptyAvailableTemplates: 'تم تعيين جميع قوالب المستندات لهذا العالم.',
      groupNameErrorRequired: 'اسم المجموعة مطلوب.',
      groupRenameInputLabel: 'اسم المجموعة',
      placementNicknameHoverOriginalNameLabel: 'الاسم الأصلي',
      placementNicknameHoverNicknameLabel: 'الاسم المستعار',
      removeGroupTooltip: 'إزالة المجموعة',
      removeTemplateTooltip: 'إزالة قالب المستند',
      templateCanonicalNameLabel: 'اسم قالب المستند',
      templateCanonicalNameTooltip: 'لإعادة تسمية قالب مستند بالكامل بشكل صحيح، يرجى الانتقال إلى قسم "قوالب المستندات" في مربع حوار التحرير هذا وتعديله هناك.',
      templateNicknameLabel: 'الاسم المستعار داخل هذا العالم',
      templateNicknameTooltip: 'يتيح لك تعيين اسم مستعار إعادة تسمية سريعة لقالب مستند داخل عالم معين دون تغيير اسمه الحقيقي عبر المشروع بأكمله.',
      missingGroupDisplayNameTreeTooltip:
        'توجد ترجمات ناقصة للغة المحددة حاليًا في اسم هذه المجموعة.',
      missingPlacementNicknameTreeTooltip:
        'توجد ترجمات ناقصة للغة المحددة حاليًا في اسم مستعار لهذا الموضع.',
      missingDocumentTemplateTitleTreeTooltip:
        'توجد ترجمات ناقصة للغة المحددة حاليًا في عنوان قالب المستند هذا.',
      contextMenu: {
        renameGroup: 'إعادة تسمية المجموعة',
        deleteGroup: 'حذف المجموعة'
      },
      renameDialog: {
        title: 'إعادة تسمية المجموعة',
        confirmButton: 'إعادة التسمية'
      }
    },
    documentTemplateName: {
      title: 'اسم قالب المستند',
      label: 'اسم قالب المستند',
      errorRequired: 'مطلوب ترجمة عنوان واحدة على الأقل لقالب المستند.'
    },
    documentTemplateWorldAppendix: {
      title: 'ملحق العالم',
      label: 'ملحق العالم',
      tooltip: 'ملحق العالم هو وصف قصير وفريد لقالب المستند عند اقترانه بعوالم فردية. يمنع هذا الالتباس عندما تشترك عدة قوالب مستندات في نفس الاسم عبر العوالم. يساعدك الملحق على تمييزها بسرعة. يظهر هذا الحقل فقط في تبويب العالم عند ربط القوالب بالعوالم، ولا يظهر في أي مكان آخر.',
      helpAriaLabel: 'مساعدة حول ملحق العالم'
    },
    documentTemplateIcon: {
      title: 'أيقونة',
      label: 'أيقونة'
    }
  },
  panels: {
    worlds: {
      title: 'عوالم المشروع',
      addWorldButton: 'إضافة عالم',
      defaultNewWorldName: 'عالم جديد',
      deleteWorldButton: 'حذف العالم',
      emptyFilteredWorlds: 'لا توجد عوالم تطابق بحثك.',
      filterAriaLabel: 'تصفية العوالم',
      filterClearAriaLabel: 'مسح تصفية العوالم',
      filterPlaceholder: 'بحث...',
      missingTranslationsTabTooltip: 'بعض الترجمات للغة المحددة حاليًا مفقودة من هذا العالم.',
      deleteConfirm: {
        confirmDeleteButton: 'تأكيد الحذف',
        message: 'هل أنت متأكد أنك تريد حذف هذا العالم؟ لا يمكن استرداد المستندات والإعدادات المرتبطة به لاحقًا. ستُفقد إلى الأبد.'
      },
      removeDisabledHasDocuments: 'أزل المستندات من هذا العالم قبل حذفه.',
      removeDisabledLastWorld: 'يجب أن يحتوي المشروع على عالم واحد على الأقل في جميع الأوقات. أنشئ عالمًا آخر أولًا لحذف هذا.'
    },
    documentTemplates: {
      title: 'قوالب المستندات',
      addFirstTemplateButton: 'أضف قالبك الأول',
      addTemplateButton: 'إضافة قالب مستند',
      defaultNewTemplateName: 'قالب مستند جديد',
      deleteTemplateButton: 'حذف القالب',
      emptyFilteredTemplates: 'لا توجد قوالب مستندات تطابق بحثك.',
      filterAriaLabel: 'تصفية قوالب المستندات',
      filterClearAriaLabel: 'مسح تصفية قوالب المستندات',
      filterPlaceholder: 'بحث...',
      missingTranslationsTabTooltip: 'بعض الترجمات للغة المحددة حاليًا مفقودة من قالب المستند هذا.',
      deleteConfirm: {
        confirmDeleteButton: 'تأكيد الحذف',
        message: 'هل أنت متأكد أنك تريد حذف قالب المستند هذا؟ ستتوقف جميع الحقول المتصلة بهذا القالب في أي قالب آخر عن العمل. كما ستتوقف جميع المستندات المتصلة عن عرض بياناتها إذا كانت قد ملئت باستخدام هذا القالب. قد يكون لهذا الحذف آثار جانبية غير مقصودة.'
      },
      removeDisabledHasDocuments: 'أزل المستندات التي تستخدم هذا القالب قبل حذفه.'
    }
  }
}

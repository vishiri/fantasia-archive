export default {
  title: 'Параметри проекту',
  closeButton: 'Закрити без збереження',
  saveButton: 'Зберегти налаштування',
  saveWithoutClosingButton: 'Зберегти без закриття',
  saveErrors: {
    tooltipIntro: 'Не вдалося зберегти. Виявлено такі помилки:',
    bulletWorldNameRequired: 'Для «{worldLabel}» потрібна назва світу.',
    bulletDuplicatePalette: 'У палітрі «{worldLabel}» знайдено повторювані кольори.',
    bulletDocumentTemplateNameRequired: 'Для «{templateLabel}» потрібна назва шаблону документа.',
    bulletWorldTemplateGroupNameRequired: 'Для «{worldLabel}» потрібна назва групи шаблонів.',
    bulletWorldTemplateDuplicateDocumentTemplate: 'Дублікат шаблону документа «{templateLabel}» у «{worldLabel}».'
  },
  singularPluralMissing: {
    bothIntro: 'Переклади для вибраної мови відсутні:',
    singularBullet: 'Відсутня форма однини',
    pluralBullet: 'Відсутня форма множини',
    usingFallback: 'Використовується резервний варіант: {fallbackLanguageName}'
  },
  categories: {
    generalSettings: {
      title: 'Загальні налаштування'
    },
    worldsSettings: {
      title: 'Світи'
    },
    documentTemplatesSettings: {
      title: 'Шаблони документів'
    }
  },
  fields: {
    projectName: {
      title: 'Назва проекту',
      label: 'Назва проекту',
      errorRequired: "Назва проекту обов'язкова."
    },
    worldName: {
      title: 'Назва світу',
      label: 'Назва світу',
      errorRequired: "Назва світу обов'язкова."
    },
    worldColor: {
      title: 'Колір',
      label: 'Колір світу',
      tooltip: 'Цей колір визначає, як ваш світ відображається в різних місцях проекту — піктограми, текст і подібний інтерфейс.'
    },
    worldColorPalette: {
      label: 'Палітра кольорів світу',
      tooltipIntro: 'Палітра кольорів дозволяє заздалегідь задати кольори, які згодом використовуватимуться в усьому проекті без ручного вибору щоразу. Це забезпечує узгодженість між документами, коли це потрібно.',
      tooltipRightClickIntro: 'Додаткові дії доступні при клацанні правою кнопкою миші окремих кольорів:',
      tooltipRightClickDeletion: 'Видалення',
      tooltipRightClickDuplication: 'Дублювання',
      addButton: 'Додати колір',
      contextMenu: {
        duplicateColor: 'Дублювати колір',
        deleteColor: 'Видалити колір'
      }
    },
    worldTemplateLayout: {
      layoutTitle: 'Ієрархічне дерево світу',
      availableTemplatesTitle: 'Доступні шаблони документів',
      availableTemplatesFilterAriaLabel: 'Фільтрувати доступні шаблони документів',
      availableTemplatesFilterClearAriaLabel: 'Очистити фільтр доступних шаблонів документів',
      availableTemplatesFilterPlaceholder: 'Пошук...',
      emptyFilteredAvailableTemplates: 'Жоден шаблон документа не відповідає вашому запиту.',
      addGroupButton: 'Додати групу',
      defaultNewGroupName: 'Нова група',
      editGroupTooltip: 'Перейменувати групу',
      editTemplateTooltip: 'Налаштувати псевдонім шаблону',
      emptyAvailableTemplates: 'Усі шаблони документів призначено цьому світу.',
      groupNameErrorRequired: "Назва групи обов'язкова.",
      groupRenameInputLabel: 'Назва групи',
      placementNicknameHoverOriginalNameLabel: 'Початкова назва',
      placementNicknameHoverNicknameLabel: 'Псевдонім',
      removeGroupTooltip: 'Видалити групу',
      removeTemplateTooltip: 'Видалити шаблон документа',
      templateCanonicalNameLabel: 'Назва шаблону документа',
      templateCanonicalNameTooltip: 'Щоб перейменувати весь шаблон документа, перейдіть до розділу «Шаблони документів» цього діалогового вікна редагування та змініть його там.',
      templateNicknameLabel: 'Псевдонім у цьому світі',
      templateNicknameTooltip: 'Псевдонім дозволяє швидко перейменувати шаблон документа в конкретному світі, не змінюючи його справжню назву в усьому проекті.',
      missingGroupDisplayNameTreeTooltip:
        'Деякі переклади для вибраної мови відсутні в цій назві групи.',
      missingPlacementNicknameTreeTooltip:
        'Деякі переклади для вибраної мови відсутні в цьому псевдонімі розміщення.',
      missingDocumentTemplateTitleTreeTooltip:
        'Деякі переклади для вибраної мови відсутні в назві цього шаблону документа.',
      contextMenu: {
        renameGroup: 'Перейменувати групу',
        deleteGroup: 'Видалити групу'
      },
      renameDialog: {
        title: 'Перейменувати групу',
        confirmButton: 'Перейменувати'
      }
    },
    documentTemplateName: {
      title: 'Назва шаблону документа',
      label: 'Назва шаблону документа',
      errorRequired: 'Потрібен принаймні один переклад назви шаблону документа.'
    },
    documentTemplateWorldAppendix: {
      title: 'Додаток світу',
      label: 'Додаток світу',
      tooltip: 'Додаток світу — це короткий унікальний опис вашого шаблону документа, коли він поєднується з окремими світами. Це запобігає плутанині, коли кілька шаблонів документів мають однакову назву в різних світах. Додаток допомагає відрізнити їх з першого погляду. Це поле з’являється лише на вкладці світу під час поєднання шаблонів зі світами, більше ніде.'
    },
    documentTemplateIcon: {
      title: 'Піктограма',
      label: 'Піктограма'
    }
  },
  panels: {
    worlds: {
      title: 'Світи проекту',
      addWorldButton: 'Додати світ',
      defaultNewWorldName: 'Новий світ',
      deleteWorldButton: 'Видалити світ',
      emptyFilteredWorlds: 'Жоден світ не відповідає вашому запиту.',
      filterAriaLabel: 'Фільтрувати світи',
      filterClearAriaLabel: 'Очистити фільтр світів',
      filterPlaceholder: 'Пошук...',
      missingTranslationsTabTooltip: 'Деякі переклади для вибраної мови відсутні в цьому світі.',
      deleteConfirm: {
        confirmDeleteButton: 'Підтвердити видалення',
        message: 'Ви впевнені, що хочете видалити цей світ? Документи та налаштування, пов’язані з ним, не можна буде відновити. Вони будуть втрачені назавжди.'
      },
      removeDisabledHasDocuments: 'Видаліть документи з цього світу перед його видаленням.',
      removeDisabledLastWorld: 'У проекті завжди має бути принаймні один світ. Спочатку створіть інший, щоб видалити цей.'
    },
    documentTemplates: {
      title: 'Шаблони документів',
      addFirstTemplateButton: 'Додайте свій перший шаблон',
      addTemplateButton: 'Додати шаблон документа',
      defaultNewTemplateName: 'Новий шаблон документа',
      deleteTemplateButton: 'Видалити шаблон',
      emptyFilteredTemplates: 'Жоден шаблон документа не відповідає вашому запиту.',
      filterAriaLabel: 'Фільтрувати шаблони документів',
      filterClearAriaLabel: 'Очистити фільтр шаблонів документів',
      filterPlaceholder: 'Пошук...',
      missingTranslationsTabTooltip: 'Деякі переклади для вибраної мови відсутні в цьому шаблоні документа.',
      deleteConfirm: {
        confirmDeleteButton: 'Підтвердити видалення',
        message: 'Ви впевнені, що хочете видалити цей шаблон документа? Усі поля, пов’язані з цим шаблоном в інших шаблонах, перестануть працювати. Крім того, усі пов’язані документи перестануть показувати свої дані, якщо їх було заповнено за допомогою цього шаблону. Це видалення може мати непередбачені наслідки.'
      },
      removeDisabledHasDocuments: 'Видаліть документи, що використовують цей шаблон, перед його видаленням.'
    }
  }
}

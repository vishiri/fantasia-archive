export default {
  title: 'Настройки проекта',
  closeButton: 'Закрыть без сохранения',
  saveButton: 'Сохранить настройки',
  saveWithoutClosingButton: 'Сохранить без закрытия',
  saveErrors: {
    tooltipIntro: 'Не удалось сохранить. Обнаружены следующие ошибки:',
    bulletWorldNameRequired: 'Для «{worldLabel}» требуется имя мира.',
    bulletDuplicatePalette: 'В палитре «{worldLabel}» найдены повторяющиеся цвета.',
    bulletDocumentTemplateNameRequired: 'Для «{templateLabel}» требуется имя шаблона документа.',
    bulletWorldTemplateGroupNameRequired: 'Для «{worldLabel}» требуется имя группы шаблонов.',
    bulletWorldTemplateDuplicateDocumentTemplate: 'Дубликат шаблона документа «{templateLabel}» в «{worldLabel}».'
  },
  singularPluralMissing: {
    bothIntro: 'Отсутствуют переводы для выбранного языка:',
    singularBullet: 'Отсутствует форма единственного числа',
    pluralBullet: 'Отсутствует форма множественного числа',
    usingFallback: 'Используется резервный вариант: {fallbackLanguageName}'
  },
  categories: {
    generalSettings: {
      title: 'Общие настройки'
    },
    worldsSettings: {
      title: 'Миры'
    },
    documentTemplatesSettings: {
      title: 'Шаблоны документов'
    }
  },
  fields: {
    projectName: {
      title: 'Имя проекта',
      label: 'Имя проекта',
      errorRequired: 'Имя проекта обязательно.'
    },
    worldName: {
      title: 'Имя мира',
      label: 'Имя мира',
      errorRequired: 'Имя мира обязательно.'
    },
    worldColor: {
      title: 'Цвет',
      label: 'Цвет мира',
      tooltip: 'Этот цвет определяет, как ваш мир отображается в разных местах проекта — значки, текст и подобный интерфейс.',
      helpAriaLabel: 'Справка о цвете мира'
    },
    worldColorPalette: {
      label: 'Палитра цветов мира',
      tooltipIntro: 'Палитра цветов позволяет заранее задать цвета, которые затем будут использоваться по всему проекту без ручного выбора каждый раз. Это обеспечивает согласованность между документами при необходимости.',
      tooltipRightClickIntro: 'Дополнительные действия доступны при щелчке правой кнопкой мыши по отдельным цветам:',
      tooltipRightClickDeletion: 'Удаление',
      tooltipRightClickDuplication: 'Дублирование',
      addButton: 'Добавить цвет',
      helpAriaLabel: 'Справка о палитре цветов мира',
      swatchAriaLabel: 'Редактировать образец цвета {hex}',
      contextMenu: {
        duplicateColor: 'Дублировать цвет',
        deleteColor: 'Удалить цвет'
      }
    },
    worldTemplateLayout: {
      layoutTitle: 'Иерархическое дерево мира',
      availableTemplatesTitle: 'Доступные шаблоны документов',
      availableTemplatesFilterAriaLabel: 'Фильтровать доступные шаблоны документов',
      availableTemplatesFilterClearAriaLabel: 'Очистить фильтр доступных шаблонов документов',
      availableTemplatesFilterPlaceholder: 'Поиск...',
      emptyFilteredAvailableTemplates: 'Ни один шаблон документа не соответствует вашему запросу.',
      addGroupButton: 'Добавить группу',
      defaultNewGroupName: 'Новая группа',
      editGroupTooltip: 'Переименовать группу',
      editTemplateTooltip: 'Изменить псевдоним шаблона',
      emptyAvailableTemplates: 'Все шаблоны документов назначены этому миру.',
      groupNameErrorRequired: 'Имя группы обязательно.',
      groupRenameInputLabel: 'Имя группы',
      placementNicknameHoverOriginalNameLabel: 'Исходное имя',
      placementNicknameHoverNicknameLabel: 'Псевдоним',
      removeGroupTooltip: 'Удалить группу',
      removeTemplateTooltip: 'Удалить шаблон документа',
      templateCanonicalNameLabel: 'Имя шаблона документа',
      templateCanonicalNameTooltip: 'Чтобы переименовать весь шаблон документа, перейдите в раздел «Шаблоны документов» этого диалога редактирования и измените его там.',
      templateNicknameLabel: 'Псевдоним в этом мире',
      templateNicknameTooltip: 'Псевдоним позволяет быстро переименовать шаблон документа в конкретном мире, не меняя его настоящее имя во всём проекте.',
      missingGroupDisplayNameTreeTooltip:
        'Для выбранного языка отсутствуют некоторые переводы в названии этой группы.',
      missingPlacementNicknameTreeTooltip:
        'Для выбранного языка отсутствуют некоторые переводы в псевдониме этого размещения.',
      missingDocumentTemplateTitleTreeTooltip:
        'Для выбранного языка отсутствуют некоторые переводы в названии этого шаблона документа.',
      contextMenu: {
        renameGroup: 'Переименовать группу',
        deleteGroup: 'Удалить группу'
      },
      renameDialog: {
        title: 'Переименовать группу',
        confirmButton: 'Переименовать'
      }
    },
    documentTemplateName: {
      title: 'Имя шаблона документа',
      label: 'Имя шаблона документа',
      errorRequired: 'Требуется хотя бы один перевод названия шаблона документа.'
    },
    documentTemplateWorldAppendix: {
      title: 'Приложение мира',
      label: 'Приложение мира',
      tooltip: 'Приложение мира — это краткое уникальное описание вашего шаблона документа при сопоставлении с отдельными мирами. Оно предотвращает путаницу, когда несколько шаблонов документов имеют одно имя в разных мирах. Приложение помогает отличать их с первого взгляда. Это поле появляется только на вкладке мира при сопоставлении шаблонов с мирами и нигде больше.',
      helpAriaLabel: 'Справка о приложении мира'
    },
    documentTemplateIcon: {
      title: 'Значок',
      label: 'Значок'
    }
  },
  panels: {
    worlds: {
      title: 'Миры проекта',
      addWorldButton: 'Добавить мир',
      defaultNewWorldName: 'Новый мир',
      deleteWorldButton: 'Удалить мир',
      emptyFilteredWorlds: 'Ни один мир не соответствует вашему запросу.',
      filterAriaLabel: 'Фильтровать миры',
      filterClearAriaLabel: 'Очистить фильтр миров',
      filterPlaceholder: 'Поиск...',
      missingTranslationsTabTooltip: 'Некоторые переводы для выбранного языка отсутствуют в этом мире.',
      deleteConfirm: {
        confirmDeleteButton: 'Подтвердить удаление',
        message: 'Вы уверены, что хотите удалить этот мир? Документы и настройки, связанные с ним, нельзя будет восстановить. Они будут потеряны навсегда.'
      },
      removeDisabledHasDocuments: 'Удалите документы из этого мира перед его удалением.',
      removeDisabledLastWorld: 'В проекте всегда должен быть хотя бы один мир. Сначала создайте другой, чтобы удалить этот.'
    },
    documentTemplates: {
      title: 'Шаблоны документов',
      addFirstTemplateButton: 'Добавить первый шаблон',
      addTemplateButton: 'Добавить шаблон документа',
      defaultNewTemplateName: 'Новый шаблон документа',
      deleteTemplateButton: 'Удалить шаблон',
      emptyFilteredTemplates: 'Ни один шаблон документа не соответствует вашему запросу.',
      filterAriaLabel: 'Фильтровать шаблоны документов',
      filterClearAriaLabel: 'Очистить фильтр шаблонов документов',
      filterPlaceholder: 'Поиск...',
      missingTranslationsTabTooltip: 'Некоторые переводы для выбранного языка отсутствуют в этом шаблоне документа.',
      deleteConfirm: {
        confirmDeleteButton: 'Подтвердить удаление',
        message: 'Вы уверены, что хотите удалить этот шаблон документа? Все поля, связанные с этим шаблоном в других шаблонах, перестанут работать. Кроме того, все связанные документы перестанут показывать свои данные, если они были заполнены с использованием этого шаблона. Это удаление может иметь непредвиденные последствия.'
      },
      removeDisabledHasDocuments: 'Удалите документы, использующие этот шаблон, перед его удалением.'
    }
  }
}

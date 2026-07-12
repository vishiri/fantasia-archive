export default {
  title: 'Configurações do projeto',
  closeButton: 'Fechar sem salvar',
  saveButton: 'Salvar configurações',
  saveWithoutClosingButton: 'Salvar sem fechar',
  saveErrors: {
    tooltipIntro: 'Não foi possível salvar. Foram encontrados os seguintes erros:',
    bulletWorldNameRequired: 'O nome do mundo é obrigatório para «{worldLabel}».',
    bulletDuplicatePalette: 'Cores duplicadas encontradas na paleta de «{worldLabel}».',
    bulletDocumentTemplateNameRequired: 'O nome do modelo de documento é obrigatório para «{templateLabel}».',
    bulletWorldTemplateGroupNameRequired: 'O nome do grupo de modelos é obrigatório para «{worldLabel}».',
    bulletWorldTemplateDuplicateDocumentTemplate: 'Modelo de documento duplicado «{templateLabel}» em «{worldLabel}».'
  },
  singularPluralMissing: {
    bothIntro: 'Faltam traduções para o idioma atual:',
    singularBullet: 'Forma singular em falta',
    pluralBullet: 'Forma plural em falta',
    usingFallback: 'Usando fallback de {fallbackLanguageName}'
  },
  categories: {
    generalSettings: {
      title: 'Configurações gerais'
    },
    worldsSettings: {
      title: 'Mundos'
    },
    documentTemplatesSettings: {
      title: 'Modelos de documento'
    }
  },
  fields: {
    projectName: {
      title: 'Nome do projeto',
      label: 'Nome do projeto',
      errorRequired: 'O nome do projeto é obrigatório.'
    },
    worldName: {
      title: 'Nome do mundo',
      label: 'Nome do mundo',
      errorRequired: 'O nome do mundo é obrigatório.'
    },
    worldColor: {
      title: 'Cor',
      label: 'Cor do mundo',
      tooltip: 'Esta cor determina como o seu mundo aparece em vários lugares do projeto — ícones, texto e elementos de interface semelhantes.',
      helpAriaLabel: 'Ajuda sobre a cor do mundo'
    },
    worldColorPalette: {
      label: 'Paleta de cores do mundo',
      tooltipIntro: 'A paleta de cores permite predefinir cores que serão usadas posteriormente em todo o projeto sem precisar selecioná-las manualmente a cada vez. Isso permite consistência entre documentos quando necessário.',
      tooltipRightClickIntro: 'Mais ações disponíveis ao clicar com o botão direito em cores individuais:',
      tooltipRightClickDeletion: 'Exclusão',
      tooltipRightClickDuplication: 'Duplicação',
      addButton: 'Adicionar cor',
      helpAriaLabel: 'Ajuda sobre a paleta de cores do mundo',
      swatchAriaLabel: 'Editar amostra de cor {hex}',
      contextMenu: {
        duplicateColor: 'Duplicar cor',
        deleteColor: 'Excluir cor'
      }
    },
    worldTemplateLayout: {
      layoutTitle: 'Árvore hierárquica do mundo',
      availableTemplatesTitle: 'Modelos de documento disponíveis',
      availableTemplatesFilterAriaLabel: 'Filtrar modelos de documento disponíveis',
      availableTemplatesFilterClearAriaLabel: 'Limpar filtro de modelos de documento disponíveis',
      availableTemplatesFilterPlaceholder: 'Pesquisar…',
      emptyFilteredAvailableTemplates: 'Nenhum modelo de documento corresponde à sua pesquisa.',
      addGroupButton: 'Adicionar grupo',
      defaultNewGroupName: 'Novo grupo',
      editGroupTooltip: 'Renomear grupo',
      editTemplateTooltip: 'Ajustar apelido do modelo',
      emptyAvailableTemplates: 'Todos os modelos de documento estão atribuídos a este mundo.',
      groupNameErrorRequired: 'O nome do grupo é obrigatório.',
      groupRenameInputLabel: 'Nome do grupo',
      placementNicknameHoverOriginalNameLabel: 'Nome original',
      placementNicknameHoverNicknameLabel: 'Apelido',
      removeGroupTooltip: 'Remover grupo',
      removeTemplateDisabledHasDocuments:
        'Remova todos os documentos ligados a este modelo antes de removê-lo.',
      removeTemplateTooltip: 'Remover modelo de documento',
      templateCanonicalNameLabel: 'Nome do modelo de documento',
      templateCanonicalNameTooltip: 'Para renomear corretamente um modelo de documento inteiro, acesse a seção «Modelos de documento» desta caixa de diálogo de edição e ajuste-o lá.',
      templateNicknameLabel: 'Apelido neste mundo',
      templateNicknameTooltip: 'Definir um apelido permite renomear rapidamente um modelo de documento dentro de um mundo específico sem alterar o nome real em todo o projeto.',
      missingGroupDisplayNameTreeTooltip:
        'Algumas traduções para o idioma selecionado estão em falta neste nome de grupo.',
      missingPlacementNicknameTreeTooltip:
        'Algumas traduções para o idioma selecionado estão em falta neste apelido de posicionamento.',
      missingDocumentTemplateTitleTreeTooltip:
        'Algumas traduções para o idioma selecionado estão em falta no título deste modelo de documento.',
      contextMenu: {
        renameGroup: 'Renomear grupo',
        deleteGroup: 'Excluir grupo'
      },
      renameDialog: {
        title: 'Renomear grupo',
        confirmButton: 'Renomear'
      }
    },
    documentTemplateName: {
      title: 'Nome do modelo de documento',
      label: 'Nome do modelo de documento',
      errorRequired: 'Pelo menos uma tradução do título do modelo de documento é obrigatória.'
    },
    documentTemplateWorldAppendix: {
      title: 'Apêndice do mundo',
      label: 'Apêndice do mundo',
      tooltip: 'O apêndice do mundo é uma descrição curta e única para o seu modelo de documento quando ele é associado a mundos individuais. Isso evita confusão quando vários modelos de documento compartilham o mesmo nome em mundos diferentes. O apêndice ajuda a distingui-los rapidamente. Este campo aparece apenas na aba Mundos ao associar modelos a mundos, em nenhum outro lugar.',
      helpAriaLabel: 'Ajuda sobre o apêndice do mundo'
    },
    documentTemplateIcon: {
      title: 'Ícone',
      label: 'Ícone'
    }
  },
  panels: {
    worlds: {
      title: 'Mundos do projeto',
      addWorldButton: 'Adicionar mundo',
      defaultNewWorldName: 'Novo mundo',
      deleteWorldButton: 'Excluir mundo',
      emptyFilteredWorlds: 'Nenhum mundo corresponde à sua pesquisa.',
      filterAriaLabel: 'Filtrar mundos',
      filterClearAriaLabel: 'Limpar filtro de mundos',
      filterPlaceholder: 'Pesquisar…',
      missingTranslationsTabTooltip: 'Algumas traduções para o idioma selecionado atualmente estão ausentes neste mundo.',
      deleteConfirm: {
        confirmDeleteButton: 'Confirmar exclusão',
        message: 'Tem certeza de que deseja excluir este mundo? Documentos e configurações vinculados a ele não poderão ser recuperados depois. Serão perdidos para sempre.'
      },
      removeDisabledHasDocuments: 'Remova os documentos deste mundo antes de excluí-lo.',
      removeDisabledLastWorld: 'Um projeto deve ter pelo menos um mundo o tempo todo. Crie outro primeiro para excluir este.'
    },
    documentTemplates: {
      title: 'Modelos de documento',
      addFirstTemplateButton: 'Adicionar seu primeiro modelo',
      addTemplateButton: 'Adicionar modelo de documento',
      defaultNewTemplateName: 'Novo modelo de documento',
      deleteTemplateButton: 'Excluir modelo',
      emptyFilteredTemplates: 'Nenhum modelo de documento corresponde à sua pesquisa.',
      filterAriaLabel: 'Filtrar modelos de documento',
      filterClearAriaLabel: 'Limpar filtro de modelos de documento',
      filterPlaceholder: 'Pesquisar…',
      missingTranslationsTabTooltip: 'Algumas traduções para o idioma selecionado atualmente estão ausentes neste modelo de documento.',
      deleteConfirm: {
        confirmDeleteButton: 'Confirmar exclusão',
        message: 'Tem certeza de que deseja excluir este modelo de documento? Todos os campos conectados a este modelo em qualquer outro modelo deixarão de funcionar. Além disso, todos os documentos conectados deixarão de exibir seus dados se algum foi preenchido usando este modelo. Esta exclusão pode ter efeitos colaterais indesejados.'
      },
      removeDisabledHasDocuments: 'Remova os documentos que usam este modelo antes de excluí-lo.'
    }
  }
}

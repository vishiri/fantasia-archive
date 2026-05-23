export default {
  title: 'Fantasia Archive Configurações',
  saveButton: 'Salvar configurações',
  closeButton: 'Fechar sem salvar',
  settingsSearchPlaceholder: 'Pesquise as configurações...',
  searchNoResultsTitle: 'Nenhuma correspondência de pesquisa',
  searchNoResultsDescription: 'Infelizmente, Fantasia não encontrou nenhuma configuração que você estava procurando. Talvez tente um termo de pesquisa diferente?',
  appOptionsCategories: {
    accessibility: {
      title: 'Acessibilidade',
      tags: 'a11y, legibilidade, visibilidade, assistência',
      accessibility: {
        subtitle: 'Acessibilidade',
        tags: 'a11y, legibilidade, visibilidade, assistência',
      }
    },
    developerSettings: {
      title: 'Configurações do desenvolvedor',
      tags: 'desenvolvedor, depuração, diagnóstico, interno',
      documentBody: {
        subtitle: 'Corpo do documento',
        tags: 'ID do documento, metadados de depuração, campos internos',
      }
    },
    documentViewEdit: {
      title: 'Visualização/edição de documento',
      tags: 'página do documento, modo de visualização, modo de edição, leitor',
      documentBody: {
        subtitle: 'Corpo do documento',
        tags: 'área de conteúdo, campos, leitura, área de edição',
      },
      documentControlBar: {
        subtitle: 'Barra de controle de documentos',
        tags: 'barra de ferramentas, barra superior, cabeçalho, documento cromado',
      }
    },
    hierarchicalTree: {
      title: 'Árvore hierárquica',
      tags: 'barra lateral, estrutura de tópicos, navegador, árvore do projeto',
      iconSettings: {
        subtitle: 'Configurações de ícone',
        tags: 'ícones de ação, botões de árvore, ícones de linha',
      },
      informationDisplaySettings: {
        subtitle: 'Configurações de exibição de informações',
        tags: 'contagens, números, índice de pedidos, exibição de metadados',
      },
      tagSettings: {
        subtitle: 'Configurações de tags',
        tags: 'rótulos, exibição de tags, agrupamento de tags',
      },
      treeBehavior: {
        subtitle: 'Comportamento da árvore',
        tags: 'expandir, recolher, expandir tudo, interação',
      },
      treeSettings: {
        subtitle: 'Configurações de árvore',
        tags: 'painel de árvore, visibilidade da barra lateral, layout de árvore',
      }
    },
    openedDocumentsTabs: {
      title: 'Abrir guias de documentos',
      tags: 'barra de guias, abrir arquivos, multitarefa',
      tabBehavior: {
        subtitle: 'Comportamento da guia',
        tags: 'alternar guias, faixa de guias, comportamento de passar o mouse',
      }
    },
    popupsFloatingWindows: {
      title: 'Pop-ups e janelas flutuantes',
      tags: 'diálogos, sobreposições, modais, janelas',
      floatingWindows: {
        subtitle: 'Janelas flutuantes',
        tags: 'desanexar, janela secundária, múltiplas janelas',
      },
      quickSearchDialog: {
        subtitle: 'Caixa de diálogo de pesquisa rápida',
        tags: 'pesquisa rápida, pesquisa de teclado, localizador',
      },
      universalDialogSettings: {
        subtitle: 'Configurações de diálogo universais',
        tags: 'todas as caixas de diálogo, comportamento pop-up global',
      }
    },
    visualAccessibility: {
      title: 'Funcionalidades visuais e em todo o aplicativo',
      tags: 'aparência, interface, global, interface do usuário, aparência',
      applicationExtras: {
        subtitle: 'Extras do aplicativo',
        tags: 'mascote, pelúcia, dicas de visão geral do projeto, extras',
      },
      visualsAppwideFunctionality: {
        subtitle: 'Funcionalidades visuais e em todo o aplicativo',
        tags: 'tema, cromo, layout, opções gerais',
      }
    },
    welcomeScreen: {
      title: 'Tela de boas-vindas',
      tags: 'inicial, tela inicial, bem-vindo, primeiro lançamento, página inicial',
      welcomeScreenBehavior: {
        subtitle: 'Comportamento da tela de boas-vindas',
        tags: 'dicas de inicialização, links sociais, integração, splash',
      }
    }
  },
  appOptions: {
    aggressiveRelationshipFilter: {
      title: 'Seleção de relacionamentos agressivos',
      description: 'Ativa o modo de sugestão automática agressiva para todas as pesquisas de relacionamento no aplicativo no modo de edição de documento. Sem isso ativado, após a filtragem, o primeiro item da lista não é selecionado automaticamente. Ativá-lo adiciona essa funcionalidade, permitindo uma seleção muito mais conveniente de documentos existentes, ao mesmo tempo que sacrifica um pouco da conveniência ao criar novos documentos dinamicamente.',
      tags: 'sugestão automática, preenchimento automático, primeira correspondência, lista de filtros, escolha existente, pesquisa de relacionamento',
    },
    allowQuickPopupSameKeyClose: {
      title: 'Feche pop-ups rápidos com a mesma tecla',
      description: 'Permite fechar os pop-ups de pesquisa rápida e adição rápida com a mesma combinação de teclas que foi usada para abri-los.',
      tags: 'alternar atalho, mesma tecla de atalho, adição rápida, descartar pop-up',
    },
    allowWiderScrollbars: {
      title: 'Barras de rolagem mais largas',
      description: 'Esta configuração torna as barras de rolagem de FA mais largas e, portanto, permite a rolagem manual por clique diretamente nelas para dispositivos que não suportam rolagem padrão (por exemplo, mouses sem roda de rolagem).',
      tags: 'largura da barra de rolagem, clique em rolagem, mouse sem roda, trackball, toque',
    },
    compactDocumentCount: {
      title: 'Ocultar contagem de categorias',
      description: 'Mostra a contagem de documentos sem o número secundário por categoria.',
      tags: 'contagem simplificada, número único, menos confusão',
    },
    compactTags: {
      title: 'Tags compactas',
      description: 'Determina se as tags são mostradas como categorias individuais ou como uma categoria com cada tag como uma subcategoria.',
      tags: 'agrupamento de tags, pasta de tags única, tags aninhadas, hierarquia de tags',
    },
    darkMode: {
      title: 'Modo escuro',
      description: 'Alterne entre o modo claro e escuro do aplicativo.',
      tags: 'escuro, claro, tema, temática, cor, cores',
    },
    disableCloseAfterSelectQuickSearch: {
      title: 'Pare de fechar após a seleção',
      description: 'Normalmente, a pesquisa rápida fecha depois que um item é selecionado. Ativar esse recurso evita esse comportamento, permitindo que você abra vários resultados de pesquisa, um após o outro.',
      tags: 'manter aberto, vários resultados, lote aberto, pesquisa rápida permanece aberta',
    },
    disableDocumentControlBar: {
      title: 'Desativar barra de controle de documentos',
      description: 'Se quiser maximizar seu espaço de trabalho no documento, você pode desativar a barra de botões superior com esta configuração. Os botões de controle necessários serão movidos para a parte superior do corpo do documento principal, enquanto o restante da funcionalidade estará acessível por meio de teclas ou através do menu do aplicativo no canto superior esquerdo.',
      tags: 'barra de ferramentas ocultar, maximizar espaço, largura total, cabeçalho do documento',
    },
    disableDocumentControlBarGuides: {
      title: 'Desativar guias de documentos',
      description: 'Ativa ou desativa os guias para iniciantes na barra de controle de documentos.',
      tags: 'dicas para iniciantes, banners de tutoriais, notas de treinador, ajuda na barra de controle',
    },
    disableDocumentCounts: {
      title: 'Ocultar totalmente a contagem de documentos',
      description: 'Oculta todas as informações de contagem de documentos na árvore hierárquica.',
      tags: 'totaliza, sem contagens, estatísticas ocultam',
    },
    disableDocumentToolTips: {
      title: 'Desativar dicas de ferramentas de documentos',
      description: 'Se você não gostar das dicas de visualização de documentos, poderá desativá-las globalmente aqui.',
      tags: 'texto instantâneo, ajuda de campo, popover, dicas de visualização de documento',
    },
    disableQuickSearchCategoryPrecheck: {
      title: 'Não verifique previamente o filtro de categoria',
      description: 'Normalmente, as categorias são incluídas na pesquisa rápida. Habilitar esta opção reverte esse comportamento.',
      tags: 'filtro de categoria, escopo de pesquisa, incluir categorias, filtro padrão',
    },
    disableSpellCheck: {
      title: 'Desativar verificação ortográfica',
      description: 'Desativa a verificação ortográfica, gramatical e de palavras no modo de edição de documento.',
      tags: 'ortografia, gramática, revisão, sublinhado vermelho, escrita, dicionário',
      note: 'Precisa de uma reinicialização completa do aplicativo para entrar em vigor!',
    },
    doNotCollapseTreeOptions: {
      title: 'Evitar o colapso do subnível na árvore',
      description: 'Impede que subcategorias na árvore hierárquica fechem quando uma categoria pai é fechada.',
      tags: 'lembre-se de crianças expandidas, aninhadas abertas, acordeão, recolhidas',
    },
    doubleDashDocCount: {
      title: 'Divisor de contagem pronunciado',
      description: 'Esta configuração adiciona outro caractere \\\\| entre a categoria e a contagem de documentos na árvore hierárquica.',
      tags: 'pipe, delimitador, separador, formato de contagem, contagens de árvores',
    },
    hideAdvSearchCheatsheetButton: {
      title: 'Botão de ajuda para ocultar relacionamentos',
      description: 'Oculta o botão de ajuda da folha de dicas de pesquisa avançada nos campos de tipo de relacionamento.',
      tags: 'campo de relacionamento, cheatsheet, ícone de ajuda, seletor de link, pesquisa avançada',
    },
    hideDeadCrossThrough: {
      title: 'Ocultar tachado',
      description: 'Esta configuração oculta o efeito riscado em documentos mortos, perdidos ou destruídos para aumentar a visibilidade.',
      tags: 'tachado, falecido, destruído, desaparecido, status do documento, riscado',
    },
    hideDocumentTitles: {
      title: 'Ocultar títulos de documentos',
      description: 'Oculta os títulos das seções grandes na visualização do documento. Observe que isso pode resultar em mudanças de layout relativamente selvagens, o que pode fazer com que o documento pareça indisciplinado em alguns casos.',
      tags: 'títulos de seção, grupos de campos, rótulos de estrutura de documento',
    },
    hideEmptyFields: {
      title: 'Ocultar campos vazios',
      description: 'Oculta campos sem nenhum valor preenchido, no modo de visualização (sem edição). Observe que isso pode resultar em mudanças de layout relativamente selvagens, o que pode fazer com que o documento pareça indisciplinado em alguns casos.',
      tags: 'campos em branco, visualização somente leitura, documento compacto, mudança de layout',
    },
    hideHierarchyTree: {
      title: 'Ocultar árvore hierárquica',
      description: 'Controla se a árvore hierárquica é mostrada.',
      tags: 'barra lateral desativada, navegador oculto, painel de árvore, ocultação de contorno',
    },
    hidePlushes: {
      title: 'Ocultar mascote Fantasia',
      description: 'Esconde o incrivelmente adorável e incrível Fantasia, o pequeno dragão arcano. Como você pôde! :(',
      tags: 'dragão, mascote, pelúcia, personagem, decoração, ovo de páscoa',
    },
    hideTooltipsProject: {
      title: 'Ocultar dicas na visão geral do projeto',
      description: 'Oculta o cartão de informações de dicas e truques da visão geral do projeto.',
      tags: 'página inicial do projeto, cartão do painel, dicas de visão geral',
    },
    hideTooltipsStart: {
      title: 'Ocultar pop-up de dicas na tela inicial',
      description: 'Oculta o pop-up de dicas e truques da tela inicial.',
      tags: 'primeiro lançamento, integração, splash, dicas de inicialização, truques',
    },
    hideTreeExtraIcons: {
      title: 'Ocultar ícones extras',
      description: 'Oculta ícones que normalmente são mostrados por conveniência, mas não adicionam funcionalidade - por exemplo, o ícone "Abrir documento" próximo a um documento sem nós filhos, que também pode ser aberto com um clique normal com o botão esquerdo em vez do ícone.',
      tags: 'ícones redundantes, desordem, árvore mínima, ações opcionais',
    },
    hideTreeIconAddUnder: {
      title: 'Ocultar o ícone "Adicionar em"',
      description: 'Esta opção oculta o ícone "Adicionar um novo documento ao pai selecionado".',
      tags: 'adicione filho, novo abaixo, mais abaixo, crie abaixo',
    },
    hideTreeIconEdit: {
      title: 'Ocultar o ícone "Editar"',
      description: 'Esta opção oculta o ícone Editar da linha.',
      tags: 'ícone de lápis, linha de edição, árvore de edição rápida',
    },
    hideTreeIconView: {
      title: 'Ocultar o ícone "Abrir"',
      description: 'Esta opção oculta o ícone Abrir da linha.',
      tags: 'abrir ícone, ir para documento, botão abrir linha',
    },
    hideTreeOrderNumbers: {
      title: 'Ocultar números de pedido',
      description: 'Oculta os números dos pedidos personalizados à esquerda dos nomes.',
      tags: 'índice de sequência, ordem manual, prefixo de classificação, medianiz esquerda',
    },
    hideRecentProjectTooltip: {
      title: 'Ocultar a dica "Procurar projetos mais recentes"',
      description: 'Oculta a dica de ferramenta no cursor dos projetos mais recentes ao lado de Retomar o projeto mais recente na tela de boas-vindas.',
      tags: 'projeto, carregar, carregando, mais recente, recente, introdução, início, bem-vindo, dica de ferramenta, pop-up, dicas de ferramentas, pop-up',
    },
    hideWelcomeScreenSocials: {
      title: 'Ocultar links sociais da tela de boas-vindas',
      description: 'Oculta todos os links sociais na tela de boas-vindas.',
      tags: 'discord, twitter, links da comunidade, mídias sociais, bem-vindo',
    },
    skipWelcomeScreen: {
      title: 'Pular tela de boas-vindas',
      description: 'Ignora a tela de boas-vindas e tenta carregar o projeto mais recente diretamente ao iniciar o aplicativo.',
      tags: 'projeto, carregar, carregando, mais recente, recente, introdução, iniciar, bem-vindo',
    },
    invertCategoryPosition: {
      title: 'Inverter posição da categoria',
      description: 'Alterna as posições da categoria e dos números dos documentos.',
      tags: 'números de troca, ordem de contagem, categoria versus contagem de documentos',
    },
    invertTreeSorting: {
      title: 'Inverter classificação de ordem personalizada de árvore',
      description: 'Classifica os documentos na árvore hierárquica na direção oposta ao padrão: do mais alto para o mais baixo.',
      tags: 'ordem reversa, ordem personalizada, direção de classificação, ascendente descendente',
    },
    limitEditorHeight: {
      title: 'Limitar a altura do editor de texto',
      description: 'Determina se o editor de texto tem altura limitada quando não está no modo de tela cheia.',
      tags: 'altura da área de texto, texto longo, editor de expansão, editor de rolagem',
    },
    noProjectName: {
      title: 'Ocultar o nome do projeto na árvore',
      description: 'Determina se o nome do projeto será mostrado na árvore hierárquica.',
      tags: 'rótulo raiz, árvore de título do projeto, ocultação de cabeçalho',
    },
    noTags: {
      title: 'Ocultar tags na árvore',
      description: 'Determina se as tags são mostradas na árvore hierárquica.',
      tags: 'rótulos desativados, faixa de tags, rótulos de árvore, ocultar rótulos',
    },
    preventAutoScroll: {
      title: 'Impedir a rolagem automática',
      description: 'Determina se os documentos recuperam suas posições de rolagem e rolam automaticamente ao alternar entre elas.',
      tags: 'posição de rolagem, lembre-se de rolar, pular para o topo, alternar guia',
    },
    preventFilledNoteBoardPopup: {
      title: 'Impedir que o bloco de notas preenchido seja exibido',
      description: 'Quando ativado, o quadro de notas não abrirá automaticamente na inicialização do aplicativo quando ainda contiver notas de sessões FA anteriores.',
      tags: 'notas adesivas, quadro de notas, inicialização, abertura automática, lembretes',
    },
    preventPreviewsDocuments: {
      title: 'Impedir visualizações de documentos',
      description: 'Controla se as visualizações rápidas ao passar o mouse são mostradas na visualização do documento e nos campos de relacionamento.',
      tags: 'cartão flutuante, espiada, pop-up de relacionamento, visualização in-line',
    },
    preventPreviewsPopups: {
      title: 'Impedir visualizações de documentos em caixas de diálogo',
      description: 'Controla se as visualizações rápidas ao passar o mouse são mostradas ao selecionar documentos em caixas de diálogo (por exemplo, o seletor de documentos existentes).',
      tags: 'caixa de diálogo de documento existente, foco do seletor, seletor de documentos, visualização modal',
    },
    preventPreviewsTabs: {
      title: 'Impedir visualizações de documentos em guias',
      description: 'Controla se as visualizações rápidas ao passar o mouse são mostradas nas guias do documento na barra de guias.',
      tags: 'passagem da guia, visualização da faixa de guias, visualização da barra de título',
    },
    preventPreviewsTree: {
      title: 'Impedir visualizações de documentos ao passar o mouse',
      description: 'Controla se as visualizações rápidas ao passar o mouse são mostradas na árvore hierárquica. Quando as visualizações instantâneas permanecem ativadas, elas podem ter um grande impacto no desempenho do aplicativo.',
      tags: 'foco na árvore, atraso, lento, fps, desempenho, visualização da barra lateral',
      note: 'Pode ter um grande impacto no desempenho do aplicativo!',
    },
    showDocumentID: {
      title: 'Mostrar IDs de documentos',
      description: 'Se estiver ativado, o corpo do documento também mostrará o valor interno do ID do documento.',
      tags: 'depuração, ID interno, identificador, ferramentas de desenvolvimento, solução de problemas',
    },
    tagsAtTop: {
      title: 'Principais tags na árvore',
      description: 'Mostra tags no topo da árvore hierárquica.',
      tags: 'ordem das tags, tags primeiro, acima das categorias',
    },
    textShadow: {
      title: 'Sombra de texto',
      description: 'Essa configuração alterna sombras de texto na árvore hierárquica, pop-ups de pesquisa de relacionamento e guias, permitindo uma aparência mais proeminente do texto em relação ao plano de fundo.',
      tags: 'contraste, legibilidade, sombra, contorno, legibilidade, clareza do texto',
    }
  }
}

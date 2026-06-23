import type { T_e2eProjectSettingsManifest } from 'app/types/T_e2eProjectSettingsManifest'

export const E2E_PROJECT_SETTINGS_PHASE1_MANIFEST: T_e2eProjectSettingsManifest = {
  projectName: 'E2E PS Alpha',
  templates: [
    {
      appendix: {
        de: ' von Alpha',
        enUS: ' of Alpha'
      },
      icon: 'fa-solid fa-dragon',
      iconSearchTerm: 'dragon',
      tabLabel: 'Character',
      titles: {
        de: {
          plural: 'Charaktere',
          singular: 'Charakter'
        },
        enUS: {
          plural: 'Characters',
          singular: 'Character'
        }
      }
    },
    {
      appendix: {
        enUS: ' of Beta'
      },
      icon: 'fa-solid fa-map',
      iconSearchTerm: 'map',
      tabLabel: 'Location',
      titles: {
        enUS: {
          plural: 'Locations',
          singular: 'Location'
        }
      }
    },
    {
      appendix: {
        de: ' von Gamma',
        enUS: ' of Gamma'
      },
      icon: 'fa-solid fa-star',
      iconSearchTerm: 'star',
      tabLabel: 'Event',
      titles: {
        de: {
          plural: 'Ereignisse'
        },
        enUS: {
          plural: 'Events',
          singular: 'Event'
        }
      }
    }
  ],
  worlds: [
    {
      layout: [],
      names: {
        de: 'Welt Alpha',
        enUS: 'World Alpha'
      },
      paletteHexes: ['#111111', '#222222', '#333333'],
      tabLabel: 'World Alpha',
      worldColor: '#a11111'
    },
    {
      layout: [],
      names: {
        enUS: 'World Beta'
      },
      paletteHexes: ['#444444', '#555555', '#666666'],
      tabLabel: 'World Beta',
      worldColor: '#11a111'
    },
    {
      layout: [],
      names: {
        de: 'Welt Gamma',
        enUS: 'World Gamma'
      },
      paletteHexes: ['#777777', '#888888', '#999999'],
      tabLabel: 'World Gamma',
      worldColor: '#1111a1'
    }
  ]
}

export const E2E_PROJECT_SETTINGS_PHASE2_MANIFEST: T_e2eProjectSettingsManifest = {
  projectName: 'E2E PS Beta',
  templates: [
    {
      appendix: {
        de: ' von Delta',
        enUS: ' of Delta'
      },
      icon: 'fa-solid fa-users',
      iconSearchTerm: 'users',
      tabLabel: 'Faction',
      titles: {
        de: {
          plural: 'Fraktionen',
          singular: 'Fraktion'
        },
        enUS: {
          plural: 'Factions',
          singular: 'Faction'
        }
      }
    },
    {
      appendix: {
        enUS: ' of Epsilon'
      },
      icon: 'fa-solid fa-camera',
      iconSearchTerm: 'camera',
      tabLabel: 'Scene',
      titles: {
        enUS: {
          plural: 'Scenes',
          singular: 'Scene'
        }
      }
    },
    {
      appendix: {
        de: ' von Zeta',
        enUS: ' of Zeta'
      },
      icon: 'fa-solid fa-paw',
      iconSearchTerm: 'paw',
      tabLabel: 'Creature',
      titles: {
        de: {
          plural: 'Kreaturen',
          singular: 'Kreatur'
        },
        enUS: {
          plural: 'Creatures',
          singular: 'Creature'
        }
      }
    }
  ],
  worlds: [
    {
      layout: [],
      names: {
        de: 'Reich Delta',
        enUS: 'Realm Delta'
      },
      paletteHexes: ['#999999', '#888888', '#777777'],
      tabLabel: 'Realm Delta',
      worldColor: '#b22222'
    },
    {
      layout: [],
      names: {
        enUS: 'Realm Epsilon'
      },
      paletteHexes: ['#666666', '#555555', '#444444'],
      tabLabel: 'Realm Epsilon',
      worldColor: '#22b222'
    },
    {
      layout: [],
      names: {
        de: 'Reich Zeta',
        enUS: 'Realm Zeta'
      },
      paletteHexes: ['#333333', '#222222', '#111111'],
      tabLabel: 'Realm Zeta',
      worldColor: '#2222b2'
    }
  ]
}

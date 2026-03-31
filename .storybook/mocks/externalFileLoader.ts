import T_documents from 'src/i18n/en-US/components/AppControlMenus/T_documents'
import T_helpInfo from 'src/i18n/en-US/components/AppControlMenus/T_helpInfo'
import T_project from 'src/i18n/en-US/components/AppControlMenus/T_project'
import T_tools from 'src/i18n/en-US/components/AppControlMenus/T_tools'
import T_socialContactButtons from 'src/i18n/en-US/components/SocialContactButtons/T_socialContactButtons'

const storybookI18nMessages: Record<string, unknown> = {
  AppControlMenus: {
    project: T_project,
    documents: T_documents,
    tools: T_tools,
    helpInfo: T_helpInfo
  },
  SocialContactButtons: T_socialContactButtons
}

const resolveTranslation = (key: string): string => {
  const fragments = key.split('.')
  let current: unknown = storybookI18nMessages

  for (const fragment of fragments) {
    if (typeof current !== 'object' || current === null || !(fragment in current)) {
      return key
    }

    current = (current as Record<string, unknown>)[fragment]
  }

  return typeof current === 'string' ? current : key
}

export const i18n = {
  global: {
    t: (key: string): string => resolveTranslation(key)
  }
}

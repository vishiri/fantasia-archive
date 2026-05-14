import prompts from '@tmaize/prompts'
import appRoot from 'app-root-path'
import { spawnSync } from 'node:child_process'
import { readdir } from 'fs/promises'
import path from 'node:path'

async function runSpecificTest () {
  const response = await prompts([
    {
      type: 'autocomplete',
      name: 'value',
      message: 'Select your Component test to run:',
      choices: await getTestList(),
      initial: 0
    }
  ], {
    onCancel: () => {
      process.exit(0)
    }
  })

  // Invoke the Playwright trim wrapper directly with the spec path. Using 'npm run … %npm_config_component%'
  // from the list picker leaves the token unexpanded on Windows (Yarn/npm), which breaks single:ci.
  const root = path.resolve(String(appRoot))
  const specRel = response.value.replaceAll('\\', '/').replace(/^\/+/u, '')
  const specResolved = path.resolve(root, specRel)

  /**
   * Pass a posix-style repo-relative path so downstream Playwright spawning never relies on shell
   * quoting around Windows absolute backslash paths under cmd.exe shell:true.
   */
  const specArg = path.relative(root, specResolved).replace(/\\/gu, '/')
  const trimmer = path.join(root, 'scripts', 'playwrightWithArtifactTrim.mjs')
  const childEnv = {
    ...process.env
  }
  delete childEnv.npm_config_component
  delete childEnv.NPM_CONFIG_COMPONENT
  const result = spawnSync(process.execPath, [
    trimmer,
    'test',
    specArg
  ], {
    cwd: root,
    env: childEnv,
    stdio: 'inherit'
  })
  process.exit(result.status === null ? 1 : result.status)
}

async function getTestList () {
  const testFolder = appRoot + '/src/components/'
  const testFileList = await readDirectory(testFolder, '.playwright.test.ts')
  const remappedFileList = remapFilePaths(testFileList)
  const testList = remappedFileList.map((file) => ({
    title: componentTestPickerLabel(file),
    value: file
  }))

  testList.sort((a, b) => a.title.localeCompare(b.title, 'en'))

  return testList
}
async function readDirectory (dir = '', fitler = '') {
  const filesInPath = await readdir(dir, { withFileTypes: true })

  const files = await Promise.all(filesInPath.map((fileInPath) => {
    const resolvedPath = path.resolve(dir, fileInPath.name)
    return fileInPath.isDirectory() ? readDirectory(resolvedPath) : resolvedPath
  }))

  return files.flat().filter((file = '') => {
    return file.includes(fitler)
  })
}

function remapFilePaths (inputList) {
  return inputList
    .map(file => {
      const remappedFile = file
        .replaceAll('\\', '/')
        .split('/src')[1]

      return '/src' + remappedFile
    })
}

/**
 * '/src/components/dialogs/DialogFoo/_tests/DialogFoo.playwright.test.ts' → 'dialogs/DialogFoo'
 * (mirrors src/components bucket folders: dialogs, elements, foundation, globals, other).
 */
function componentTestPickerLabel (repoRelativeSrcPath) {
  const norm = repoRelativeSrcPath.replaceAll('\\', '/')
  const marker = '/src/components/'
  const idx = norm.indexOf(marker)
  if (idx === -1) {
    return path.basename(repoRelativeSrcPath)
  }
  const tail = norm.slice(idx + marker.length)
  const segments = tail.split('/')
  if (segments.length >= 2) {
    const bucket = segments[0]
    const componentFolder = segments[1]
    return `${bucket}/${componentFolder}`
  }
  return path.basename(repoRelativeSrcPath)
}

runSpecificTest()

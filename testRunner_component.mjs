import prompts from '@tmaize/prompts'
import appRoot from 'app-root-path'
import { spawn } from 'node:child_process'
import { resolve } from 'path'
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

  spawn('npm', ['run', 'test:components:single:ci', response.value], {
    stdio: 'inherit',
    shell: true
  })
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
async function readDirectory (path = '', fitler = '') {
  const filesInPath = await readdir(path, { withFileTypes: true })

  const files = await Promise.all(filesInPath.map((fileInPath) => {
    const resolvedPath = resolve(path, fileInPath.name)
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
 * '/src/components/dialogs/DialogFoo/tests/DialogFoo.playwright.test.ts' → 'dialogs/DialogFoo'
 * (mirrors src/components bucket folders: dialogs, elements, globals, other).
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

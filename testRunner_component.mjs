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

  spawn('npm', ['run', 'test:componentSingleAuto', response.value], { stdio: 'inherit', shell: true })
}

async function getTestList () {
  const testFolder = appRoot + '/src/components/'
  const testFileList = await readDirectory(testFolder, '.playwright.test.ts')
  const remappedFileList = remapFilePaths(testFileList)
  const remappedNameList = remapFileNames(remappedFileList)
  const testList = []

  for (let i = 0; i < remappedFileList.length; i++) {
    testList.push({
      title: remappedNameList[i],
      value: remappedFileList[i]
    })
  }

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

function remapFileNames (inputList) {
  return inputList.map(file => {
    return path.basename(file)
  })
}

runSpecificTest()

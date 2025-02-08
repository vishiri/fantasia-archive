import fs from 'fs'
import appRoot from 'app-root-path'
import { spawn } from 'node:child_process'
import prompts from '@tmaize/prompts'

async function runSpecificTest () {
  const response = await prompts([
    {
      type: 'autocomplete',
      name: 'value',
      message: 'Select your E2E test to run:',
      choices: await getTestList(),
      initial: 0
    }
  ], {
    onCancel: () => {
      process.exit(0)
    }
  })

  spawn('npm', ['run', 'test:e2eSingleAuto', response.value], { stdio: 'inherit', shell: true })
}

async function getTestList () {
  const testFolder = appRoot + '/e2e-tests'
  const testList = []
  const fileList = fs.readdirSync(testFolder)

  for (const file of fileList) {
    testList.push({
      title: file,
      value: file
    })
  }

  return testList
}

runSpecificTest()

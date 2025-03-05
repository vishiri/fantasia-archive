const { Project } = require('ts-morph')
const { join, relative } = require('path')
const chalk = require('chalk')

const project = new Project({
  tsConfigFilePath: join(__dirname, 'tsconfig.json')
})

console.log('Project loaded')

const electronPolyFillMapping = {
  ipcRenderer: 'app/electron-polyfill/ipcRenderer',
  shell: 'app/electron-polyfill/shell',
  BrowserWindow: 'app/electron-polyfill/BrowserWindow',
  contextBridge: 'app/electron-polyfill/contextBridge'
}

const anyPackage = {
  "app-root-path": 'app/electron-polyfill/app-root-path'
}

const resulting = []

const ContentBridgeAPIs = project.getSourceFile('src-electron/electron-preload.ts')

function getArray (...b) { if (b.length < 1) throw Error('Not enough arguments'); let a, c = []; for (a = 0; a < b[0].length; a++) { const d = []; b.forEach(e => d.push(e[a])); c.push(d) } return c }

function getElements (file) {
  const imports = file.getImportDeclarations(i => i.getNamedImports() !== null)

  const declarations = imports// .getImportClause();

  const list1 = declarations.map(k => k.getModuleSpecifier().getText())
  const list2 = declarations.map(k => (k.getNamedImports().length>0?k.getNamedImports():[k.getDefaultImport()]).map(e => e.getText()))
  const A2d = getArray(declarations, list1, list2)
  const elc = A2d.filter(e => e[1].indexOf('@electron') > -1 || e[1] === 'electron' || e[1] === "'electron'")
  const nelc = A2d.filter(e => e[1].indexOf('@electron') === -1 && e[1] !== 'electron' && e[1] !== "'electron'")
  return { A2d, elc, nelc }
}

let layer = 0

function apply (sourceFile, nowrite, overwrite) {
  console.log('  '.repeat(layer) + '>>>', sourceFile.getBaseName(), overwrite ? chalk.red('overwrite') : chalk.green('new file'), nowrite ? chalk.red('not writing') : chalk.green('writing'))
  layer++

  let { A2d, elc, nelc } = getElements(sourceFile)
  if (A2d.length === 0) {
    layer--
    console.log('  '.repeat(layer) + '<<<', sourceFile.getFilePath(), chalk.blue('no changes'))
    return sourceFile.getFilePath()
  }
  const file = ( elc.length > 0 || nelc.filter(i=>anyPackage[i[1].replaceAll("'","")]).length > 0 ) && !overwrite ? sourceFile.copy(join(sourceFile.getDirectoryPath(), sourceFile.getBaseName().replace('-front.ts', '').slice(0, -3) + '-front.ts'), { overwrite: true }) : sourceFile
  nowrite = !nowrite ? elc.length === 0 && !overwrite : nowrite;

  ({ A2d, elc, nelc } = getElements(file))

  for (const p of elc) {
    const i = p[2]
    p[0].remove()
    const o = i.map(e => [e, electronPolyFillMapping[e]])
    if (o.filter(e => e[1] === undefined) > 0) continue
    // o=o.map(e=>factory.createStringLiteral(e))
    for (const i of o) {
      if (!i[1] && resulting.indexOf(i[0]) === -1)resulting.push(i[0])
      file.addImportDeclaration({ namedImports: [i[0]], moduleSpecifier: i[1] || 'to-be-added---or-something-like-this' })
    }
  }
  if (nelc && nelc.length > 0) {
    for (const i of nelc) {
	  if(anyPackage[i[1].replaceAll("'","")]!==undefined){
        i[0].remove()
        file.addImportDeclaration({ namedImports: i[2], moduleSpecifier: anyPackage[i[1].replaceAll("'","")] })
		nowrite = false;
		continue;
	  }
      const k = i[0].getModuleSpecifierSourceFile() || project.getSourceFile((i[0].getModuleSpecifierValue().slice(1) + '.ts').replace('-front.ts', ''))
      if (!k) continue
      let path = apply(k)
      //if(path===k.getFilePath())continue;
	  path = relative(process.cwd(), path);
	  path = path.replaceAll("\\","/");
	  path = "app"+"/"+path;
      i[0].setModuleSpecifier(path)
    }
  }
  if (!nowrite)file.save()
  // if(!nowrite)console.log("",file.getFilePath());
  layer--
  console.log('  '.repeat(layer) + '<<<', sourceFile.getFilePath(), (nowrite?chalk.blue('no changes'):chalk.magenta('changed')))
  return file.getFilePath()
}

apply(ContentBridgeAPIs, !!0, !1)

if (resulting.length > 0)console.log(chalk.yellow('\nmodules without polyfill', ...resulting))

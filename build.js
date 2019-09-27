const distFolder = 'dist'

const shell = require('shelljs')
const fs = require('fs')

// Delete distFolder
console.log('... Removing ' + distFolder + ' folder')
shell.rm('-rf', distFolder)

// Build typescript
console.log('... Building TypeScript')
shell.exec('tsc')

// Write package.json as a public module
console.log('... Copying files')
const pkg = require('./package.json')
delete pkg.private // Make dist folder public
delete pkg.scripts
fs.writeFileSync(distFolder + '/package.json', JSON.stringify(pkg, null, 2), 'utf8')

// Copy other files
// shell.cp('-rf', 'package-lock.json', distFolder)
shell.cp('-rf', 'README.md', distFolder)
// shell.cp('-rf', 'src/@types', path.join(distFolder, '@types'))

console.log('Done.')
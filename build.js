const distFolder = 'dist'

const shell = require('shelljs')

// Delete distFolder
console.log('... Removing ' + distFolder + ' folder')
shell.rm('-rf', distFolder)

// Build typescript
console.log('... Building TypeScript')
shell.exec('tsc')

console.log('Done.')
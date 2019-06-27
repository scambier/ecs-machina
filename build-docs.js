const shell = require('shelljs')

// Clean
shell.rm('-rf', './docs/*')

// Vuepress docs
shell.exec('npx vuepress build docs-raw')
shell.mv('./docs-raw/.vuepress/dist/*', './docs/')

// Generated api docs
shell.exec('npx typedoc --options ./typedoc.config.js ./src')
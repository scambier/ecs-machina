const shell = require('shelljs')

// Vuepress docs
shell.exec('npx vuepress build docs')

// Generated api docs
shell.exec('npx typedoc --options ./typedoc.config.js ./src')

// Publish
shell.cd('docs/.vuepress/dist')
shell.exec('git init')
shell.exec('git add -A')
shell.exec('git commit -m "deploy"')
shell.exec('git push -f git@github.com:scambier/ecs-machina.git master:gh-pages')
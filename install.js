const util = require('util');
const path = require("path")

const exec = util.promisify(require('child_process').exec)

const install = async () => {
    console.log('Install self deps')
    await exec('npm install')
    console.log('Install & Building Base types')
    await exec('npm install --prefix ' + path.join(__dirname, 'base-types'))
    await exec('npm run build --prefix ' + path.join(__dirname, 'base-types'))
    console.log('Installing web')
    await exec('npm install --prefix ' + path.join(__dirname, 'web') + ' ' + path.join(__dirname, 'base-types', 'base-types-1.0.0.tgz'))
    console.log('Installing core')
    await exec('npm install --prefix ' + path.join(__dirname, 'core') + ' ' + path.join(__dirname, 'base-types', 'base-types-1.0.0.tgz'))
    console.log('Installing server')
    await exec('npm install --prefix ' + path.join(__dirname, 'server') + ' ' + path.join(__dirname, 'base-types', 'base-types-1.0.0.tgz'))
}

install()
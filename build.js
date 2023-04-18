const util = require('util');
const path = require("path")
const fs = require("fs-extra")

const exec = util.promisify(require('child_process').exec)

const build = async () => {
    console.log('Building web')
    await exec('npm run build --prefix ' + path.join(__dirname, 'web'))
    console.log('Building core')
    await exec('npm run build --prefix ' + path.join(__dirname, 'core'))
    console.log('Building server')
    await exec('npm run build --prefix ' + path.join(__dirname, 'server'))

    fs.access(path.join(__dirname, 'server', 'dist', 'public'))
        .then(() => fs.remove(path.join(__dirname, 'server', 'dist', 'public')))
        .catch(() => console.log('Copy web into server'))
        .finally(() => fs.copy(
            path.join(__dirname, 'web', 'dist'),
            path.join(__dirname, 'server', 'dist', 'public'),
            { overwrite: true }
        ))
}

build()
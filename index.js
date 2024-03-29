const dotenv = require('dotenv')
const path = require("path")
const fs = require("fs-extra")
const fork = require("child_process").fork

const startAllchildProcess = () => {
    dotenv.config()
    const startServer = path.join(__dirname, 'server', 'dist', 'index.js')
    fork(startServer)
    const startCore = path.join(__dirname, 'core', 'dist', 'index.js')
    fork(startCore)
}

const checkAllFiles = () => {
    fs.access(path.join(__dirname, 'custom_start'))
        .catch((e) => fs.mkdir(path.join(__dirname, 'custom_start'), { recursive: true }))
        .then(() => fs.access(path.join(__dirname, 'custom_start', 'custom.js')))
        .catch((e) => fs.copyFile(
            path.join(__dirname, 'core', 'dist', 'custom_start', 'custom_example.js'),
            path.join(__dirname, 'custom_start', 'custom.js')
        ))
        .then((e) => fs.copyFile(
            path.join(__dirname, 'custom_start', 'custom.js'),
            path.join(__dirname, 'core', 'dist', 'custom_start', 'custom.js')
        ))
        .then(() => fs.access(path.join(__dirname, '.env')))
        .catch(() => fs.copyFile(
            path.join(__dirname, '.env_example'),
            path.join(__dirname, '.env')
        ))
        .then(() => startAllchildProcess())
}

checkAllFiles()
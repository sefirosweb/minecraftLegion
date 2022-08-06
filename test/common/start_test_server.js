/* eslint-env mocha */

const assert = require('assert')
const mineflayer = require('mineflayer')
const commonTest = require('../externalTests/plugins/testCommon')
const mc = require('minecraft-protocol')
const fs = require('fs')
const path = require('path')

// set this to false if you want to test without starting a server automatically
const START_THE_SERVER = true
// if you want to have time to look what's happening increase this (milliseconds)
const TEST_TIMEOUT_MS = 90000

const excludedTests = ['digEverything', 'book', 'anvil', 'placeEntity']

const propOverrides = {
    'level-type': 'FLAT',
    'spawn-npcs': 'true',
    'spawn-animals': 'false',
    'online-mode': 'false',
    gamemode: '1',
    'spawn-monsters': 'false',
    'generate-structures': 'false',
    'enable-command-block': 'true',
    'use-native-transport': 'false' // java 16 throws errors without this, https://www.spigotmc.org/threads/unable-to-access-address-of-buffer.311602
}

const Wrap = require('minecraft-wrap').Wrap
const download = require('minecraft-wrap').download

const MC_SERVER_PATH = path.join(__dirname, 'server')


let PORT = 25565
const supportedVersion = "1.18.2"
const mcData = require('minecraft-data')(supportedVersion)
const version = mcData.version
const MC_SERVER_JAR_DIR = process.env.MC_SERVER_JAR_DIR || `${process.cwd()}/server_jars`
const MC_SERVER_JAR = `${MC_SERVER_JAR_DIR}/minecraft_server.${version.minecraftVersion}.jar`
const wrap = new Wrap(MC_SERVER_JAR, `${MC_SERVER_PATH}_${supportedVersion}`)
wrap.on('line', (line) => {
    console.log(line)
})

download(version.minecraftVersion, MC_SERVER_JAR, (err) => {
    if (err) {
        console.log(err)
        done(err)
        return
    }
    propOverrides['server-port'] = PORT
    wrap.startServer(propOverrides, (err) => {
        if (err) return done(err)
        console.log(`pinging ${version.minecraftVersion} port : ${PORT}`)
        mc.ping({
            port: PORT,
            version: supportedVersion
        }, (err, results) => {
            if (err) return done(err)
            console.log('pong')
            assert.ok(results.latency >= 0)
            assert.ok(results.latency <= 1000)
            begin()
        })
    })
})


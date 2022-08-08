/* eslint-env mocha */
//@ts-nocheck

import 'module-alias/register';
import { createNewBot } from "@/createNewBot";
import { Bot } from '@/types';

const assert = require('assert')
const mineflayer = require('mineflayer')
const commonTest = require('./legionTests/plugins/testCommon')
const mc = require('minecraft-protocol')
const fs = require('fs')
const path = require('path')

const { getPort } = require('./common/util')

// set this to false if you want to test without starting a server automatically
const START_THE_SERVER = false
// if you want to have time to look what's happening increase this (milliseconds)
const TEST_TIMEOUT_MS = 180000

const excludedTests = ['digEverything', 'book', 'anvil', 'placeEntity']

const propOverrides = {
  'level-type': 'FLAT',
  'spawn-npcs': 'true',
  'spawn-animals': 'true',
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

const supportedVersion = "1.18.2"

const mcData = require('minecraft-data')(supportedVersion)
const version = mcData.version
const MC_SERVER_JAR_DIR = process.env.MC_SERVER_JAR_DIR || `${process.cwd()}/server_jars`
const MC_SERVER_JAR = `${MC_SERVER_JAR_DIR}/minecraft_server.${version.minecraftVersion}.jar`

const wrap = new Wrap(MC_SERVER_JAR, `${MC_SERVER_PATH}_${supportedVersion}`)
wrap.on('line', (line) => {
  console.log(line)
})

describe(`mineflayer_external ${version.minecraftVersion}`, function () {
  let bot: Bot | undefined
  let PORT
  let HOST

  this.timeout(10 * 60 * 1000)
  before(async function () {
    if (START_THE_SERVER) {
      PORT = await getPort()
      HOST = 'localhost'
    } else {
      PORT = 25565
      HOST = 'minecraftLegion_test_server'
    }
    console.log(`Port chosen: ${PORT}`)
  })
  before((done) => {
    function begin() {
      bot = createNewBot({
        server: HOST,
        botName: 'flatbot',
        port: PORT,
        customStart: false
      })

      bot.once('spawn', () => {
        commonTest(bot)
        done()
      })
    }

    if (START_THE_SERVER) {
      console.log('downloading and starting server')
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
            wrap.writeServer('op flatbot\n')
            wrap.writeServer('op Sefiros\n')
            assert.ok(results.latency >= 0)
            assert.ok(results.latency <= 1000)
            begin()
          })
        })
      })
    } else begin()
  })

  beforeEach(async () => {
    console.log('reset state')
    await bot.test.resetState()
  })

  after((done) => {
    bot.quit()
    if (START_THE_SERVER) {
      wrap.stopServer((err) => {
        if (err) {
          console.log(err)
        }
        done(err)
        wrap.deleteServerData((err) => {
          if (err) {
            console.log(err)
          }
          done(err)
        })
      })
    } else {
      done()
    }
  })

  const externalTestsFolder = path.resolve(__dirname, './legionTests')
  fs.readdirSync(externalTestsFolder)
    .filter(file => fs.statSync(path.join(externalTestsFolder, file)).isFile())
    .forEach((test) => {
      test = path.basename(test, '.js')

      const testFunctions = require(`./legionTests/${test}`)(supportedVersion)

      const runTest = (testName, testFunction) => {
        return function (done) {
          this.timeout(TEST_TIMEOUT_MS)
          bot.test.sayEverywhere(`starting ${testName}`)
          testFunction(bot, done).then(res => done()).catch(e => done(e))
        }
      }

      if (excludedTests.indexOf(test) === -1) {
        if (typeof testFunctions === 'object') {
          for (const testFunctionName in testFunctions) {
            if (testFunctions[testFunctionName] !== undefined) {
              console.log(1)
              it(`${test} ${testFunctionName}`, (testFunctionName => runTest(`${test} ${testFunctionName}`, testFunctions[testFunctionName]))(testFunctionName))
            }
          }
        } else {
          it(test, runTest(test, testFunctions))
        }

      }
    })
})

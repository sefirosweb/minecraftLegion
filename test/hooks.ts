

/* eslint-env mocha */
//@ts-nocheck

import 'module-alias/register';
import { createNewBot } from "@/createNewBot";
import { Bot } from '@/types';
import mcDataLoader from 'minecraft-data'
import { getPort } from './common/util'
import assert from 'assert'
import commonTest from './legionTests/plugins/testCommon'
import fs from 'fs'
import path from 'path'

import { Wrap, download } from 'minecraft-wrap'

// set this to false if you want to test without starting a server automatically
const START_THE_SERVER = false
// if you want to have time to look what's happening increase this (milliseconds)
export const TEST_TIMEOUT_MS = 180000

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

const MC_SERVER_PATH = path.join(__dirname, 'server')

const supportedVersion = "1.18.2"

const mcData = mcDataLoader(supportedVersion)
const version = mcData.version
const MC_SERVER_JAR_DIR = process.env.MC_SERVER_JAR_DIR || `${process.cwd()}/server_jars`
const MC_SERVER_JAR = `${MC_SERVER_JAR_DIR}/minecraft_server.${version.minecraftVersion}.jar`

const wrap = new Wrap(MC_SERVER_JAR, `${MC_SERVER_PATH}_${supportedVersion}`)
wrap.on('line', (line) => {
    console.log(line)
})

export let bot: Bot

export const mochaHooks = () => {
    return {
        beforeAll() {

            before((done) => {
                let PORT
                let HOST

                if (bot !== undefined) {
                    done()
                    return
                }

                PORT = 25565
                HOST = 'minecraftLegion_test_server'
                console.log(`Port chosen: ${PORT}`)

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
                    console.log('Downloading and starting server')

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
                } else {
                    begin()
                }
            })

        },

        afterAll() {
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
        }

    }
}

import { createNewBot } from "@/createNewBot";
import { Bot } from '@/types';
import injectCommonTest from './legionTests/plugins/testCommon'

export const TEST_TIMEOUT_MS = 180000
export let bot: Bot

export const mochaHooks = () => {
    return {
        beforeAll() {
            before((done) => {
                let PORT: number
                let HOST: string

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
                        injectCommonTest(bot)
                        done()
                    })
                }

                begin()
            })

        },

        afterAll() {
            after((done) => {
                bot.quit()
                done()
            })
        }

    }
}
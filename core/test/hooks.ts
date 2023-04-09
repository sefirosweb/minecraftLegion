import injectCommonTest from './legionTests/plugins/testCommon'
import { createNewBot } from "../src/createNewBot";
import { TestBot } from 'base-types';

export const TEST_TIMEOUT_MS = 180000
export let bot: TestBot

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
                HOST = 'localhost'
                console.log(`Port chosen: ${PORT}`)

                function begin() {
                    bot = createNewBot({
                        server: HOST,
                        botName: 'flatbot',
                        port: PORT,
                        customStart: false
                    }) as TestBot

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
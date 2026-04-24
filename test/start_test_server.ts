import mc from 'minecraft-protocol'
import path from 'path'
import mcDataLoader from 'minecraft-data'

// @ts-ignore
import { Wrap } from 'minecraft-wrap'
// @ts-ignore
import { download } from 'minecraft-wrap'

const propOverrides = {
    'level-type': 'FLAT',
    'spawn-npcs': 'true',
    'spawn-animals': 'true',
    'online-mode': 'false',
    gamemode: '2',
    'spawn-monsters': 'false',
    'generate-structures': 'false',
    'enable-command-block': 'true',
    'use-native-transport': 'false', // java 16 throws errors without this, https://www.spigotmc.org/threads/unable-to-access-address-of-buffer.311602
    'server-port': 255655
}

const MC_SERVER_PATH = path.join(__dirname, 'server_jars', 'server')

let PORT = 25565
const supportedVersion = "1.21"
const mcData = mcDataLoader(supportedVersion)
const version = mcData.version
const MC_SERVER_JAR_DIR = process.env.MC_SERVER_JAR_DIR || path.join(__dirname, 'server_jars')
const MC_SERVER_JAR = `${MC_SERVER_JAR_DIR}/minecraft_server.${version.minecraftVersion}.jar`
const wrap = new Wrap(MC_SERVER_JAR, `${MC_SERVER_PATH}_${supportedVersion}`)

const AUTO_OP_USERS = new Set(['flatbot', 'lordvivi'])
const alreadyOpped = new Set<string>()

wrap.on('line', (line: string) => {
    console.log(line)
    const match = line.match(/INFO\]: (\S+) joined the game/)
    if (!match) return
    const username = match[1]
    const key = username.toLowerCase()
    if (AUTO_OP_USERS.has(key) && !alreadyOpped.has(key)) {
        alreadyOpped.add(key)
        wrap.writeServer(`op ${username}\n`)
        console.log(`auto-op: granted op to ${username}`)
    }
})

download(version.minecraftVersion, MC_SERVER_JAR, (err: Error) => {
    if (err) {
        console.log(err)
        return
    }
    propOverrides['server-port'] = PORT
    wrap.startServer(propOverrides, () => {
        console.log(`pinging ${version.minecraftVersion} port : ${PORT}`)

        const serverConection = {
            port: PORT,
            version: supportedVersion
        }

        mc.ping(serverConection, () => {
            console.log('pong')
        })
    })
})


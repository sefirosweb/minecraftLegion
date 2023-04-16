import 'dotenv/config'

type Config = {
  listenPort: number
  adminPassword: string
  debug: boolean
  secretToken: string
}

if (process.env.WEB_SERVER_PORT === undefined) throw Error('MISSING WEB_SERVER_PORT')
if (process.env.WEB_SERVER_PASSWORD === undefined) throw Error('MISSING WEB_SERVER_PASSWORD')
if (process.env.SECRET_TOKEN === undefined) throw Error('MISSING SECRET_TOKEN')

export const listenPort = parseInt(process.env.WEB_SERVER_PORT)
export const adminPassword = process.env.WEB_SERVER_PASSWORD
export const debug = process.env.DEBUG == "true" ? true : false
export const secretToken = process.env.SECRET_TOKEN

export const config: Config = {
  listenPort,
  adminPassword,
  debug,
  secretToken,
};

export default config;

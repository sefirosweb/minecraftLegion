import 'dotenv/config'

type Config = {
  frontEndPort: number
  listenPort: number
  adminPassword: string
  originCors: string
  debug: boolean
  secretToken: string
}

if (process.env.FRONT_END_PORT === undefined) throw Error('MISSING FRONT_END_PORT')
if (process.env.WEB_SERVER_PORT === undefined) throw Error('MISSING WEB_SERVER_PORT')
if (process.env.WEB_SERVER_PASSWORD === undefined) throw Error('MISSING WEB_SERVER_PASSWORD')
if (process.env.ORIGIN_CORS === undefined) throw Error('MISSING ORIGIN_CORS')
if (process.env.SECRET_TOKEN === undefined) throw Error('MISSING SECRET_TOKEN')

export const frontEndPort = parseInt(process.env.FRONT_END_PORT)
export const listenPort = parseInt(process.env.WEB_SERVER_PORT)
export const adminPassword = process.env.WEB_SERVER_PASSWORD
export const originCors = process.env.ORIGIN_CORS
export const debug = process.env.DEBUG == "true" ? true : false
export const secretToken = process.env.SECRET_TOKEN

export const config: Config = {
  frontEndPort,
  listenPort,
  adminPassword,
  originCors,
  debug,
  secretToken,
};

export default config;

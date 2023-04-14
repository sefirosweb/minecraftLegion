import dotenv from 'dotenv'

dotenv.config()

type Config = {
  environment: string
  server: string
  port: number
  masters: Array<string>
  webServer?: string
  webServerPort?: number
  webServerPassword?: string
  debugMode: boolean
  customStart: boolean
  autoRestart: boolean
}

if (process.env.ENVIRONMENT === undefined) throw Error('MISSING ENVIRONMENT')
if (process.env.SERVER === undefined) throw Error('MISSING SERVER')
if (process.env.PORT === undefined) throw Error('MISSING PORT')

export const environment = process.env.ENVIRONMENT
export const server = process.env.SERVER
export const port = parseInt(process.env.PORT)
export const masters = process.env.MASTERS ? process.env.MASTERS.split(',') : []
export const webServer = process.env.WEB_SERVER
export const webServerPort = process.env.WEB_SERVER_PORT ? parseInt(process.env.WEB_SERVER_PORT) : undefined
export const webServerPassword = process.env.WEB_SERVER_PASSWORD
export const debugMode = process.env.DEBUG_MODE && process.env.DEBUG_MODE === "true" ? true : false
export const customStart = process.env.CUSTOM_START && process.env.CUSTOM_START === "true" ? true : false
export const autoRestart = process.env.AUTO_RESTART && process.env.AUTO_RESTART === "true" ? true : false

const config: Config = {
  environment,
  server,
  port,
  masters,
  webServer,
  webServerPort,
  webServerPassword,
  debugMode,
  customStart,
  autoRestart,
};

export default config;

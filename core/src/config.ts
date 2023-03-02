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

const config: Config = {
  environment: process.env.ENVIRONMENT,
  server: process.env.SERVER,
  port: parseInt(process.env.PORT),
  masters: process.env.MASTERS ? process.env.MASTERS.split(',') : [],
  webServer: process.env.WEB_SERVER,
  webServerPort: process.env.WEB_SERVER_PORT ? parseInt(process.env.WEB_SERVER_PORT) : undefined,
  webServerPassword: process.env.WEB_SERVER_PASSWORD,
  debugMode: process.env.DEBUG_MODE && process.env.DEBUG_MODE === "true" ? true : false,
  customStart: process.env.CUSTOM_START && process.env.CUSTOM_START === "true" ? true : false,
  autoRestart: process.env.AUTO_RESTART && process.env.AUTO_RESTART === "true" ? true : false,
};

export default config;

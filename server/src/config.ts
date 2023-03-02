import dotenv from 'dotenv'

dotenv.config()

type Config = {
  listenPort: number
  adminPassword: string
  originCors: string
  debug: boolean
}

if (process.env.WEB_SERVER_PORT === undefined) throw Error('MISSING WEB_SERVER_PORT')
if (process.env.WEB_SERVER_PASSWORD === undefined) throw Error('MISSING WEB_SERVER_PASSWORD')
if (process.env.ORIGIN_CORS === undefined) throw Error('MISSING ORIGIN_CORS')

const config: Config = {
  listenPort: parseInt(process.env.WEB_SERVER_PORT),
  adminPassword: process.env.WEB_SERVER_PASSWORD,
  originCors: process.env.ORIGIN_CORS,
  debug: process.env.DEBUG == "true" ? true : false,
};

export default config;

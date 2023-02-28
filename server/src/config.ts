import dotenv from 'dotenv'

dotenv.config()

type Config = {
  listenPort: number
  adminPassword: string
  originCors: string
  debug: boolean
}

if (process.env.LISTEN_PORT === undefined) throw Error('MISSING LISTEN_PORT')
if (process.env.ADMIN_PASSWORD === undefined) throw Error('MISSING ADMIN_PASSWORD')
if (process.env.ORIGIN_CORS === undefined) throw Error('MISSING ORIGIN_CORS')

const config: Config = {
  listenPort: parseInt(process.env.LISTEN_PORT),
  adminPassword: process.env.ADMIN_PASSWORD,
  originCors: process.env.ORIGIN_CORS,
  debug: process.env.DEBUG == "true" ? true : false,
};

export default config;

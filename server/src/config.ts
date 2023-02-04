import dotenv from 'dotenv'

dotenv.config()

type Config = {
  listenPort: number
  adminPassword: string
  webClient: string
  debug: boolean
}

if (process.env.LISTEN_PORT === undefined) throw Error('MISSING LISTEN_PORT')
if (process.env.ADMIN_PASSWORD === undefined) throw Error('MISSING ADMIN_PASSWORD')
if (process.env.WEB_CLIENT === undefined) throw Error('MISSING WEB_CLIENT')

const config: Config = {
  listenPort: parseInt(process.env.LISTEN_PORT),
  adminPassword: process.env.ADMIN_PASSWORD,
  webClient: process.env.WEB_CLIENT,
  debug: process.env.DEBUG == "true" ? true : false,
};

export default config;

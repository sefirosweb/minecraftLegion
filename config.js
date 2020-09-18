const config_env = require('dotenv').config({ path: __dirname + '/.env' })
const config = {
    USER: process.env.USER,
    AUTOLOGIN: process.env.AUTOLOGIN,
    PORT: process.env.PORT,
    SERVER: process.env.SERVER,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_HOST: process.env.DB_HOST,
    DB_NAME: process.env.DB_NAME
};
module.exports = config
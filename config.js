const config_env = require('dotenv').config({ path: __dirname + '/.env' })
const config = {
    username: process.env.USER,
    password: process.env.PASSWORD,
    autologin: process.env.AUTOLOGIN,
    port: process.env.PORT,
    server: process.env.SERVER,

    db_user: process.env.DB_USER,
    db_password: process.env.DB_PASSWORD,
    db_host: process.env.DB_HOST,
    db_name: process.env.DB_NAME
};
module.exports = config
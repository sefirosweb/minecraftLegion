import { Sequelize } from 'sequelize';
import path from 'path'

export const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '..', '..', 'db', 'database.sqlite'),
    logging: false
});
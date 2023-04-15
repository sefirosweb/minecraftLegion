import { Model, DataTypes } from 'sequelize';
import { sequelize } from '@/models/sequalize';

export type BotAttributes = {
    name: string;
    config: string;
}

// type BotCreationAttributes = Optional<BotAttributes, 'id'>;
type BotCreationAttributes = BotAttributes


export class Bot extends Model<BotAttributes, BotCreationAttributes> {
    declare name: string;
    declare config: string;
}

export default Bot.init(
    {
        name: {
            type: DataTypes.JSON,
            primaryKey: true,
            allowNull: false,
            validate: {
                notEmpty: true,
            }
        },
        config: {
            type: DataTypes.JSON,
            allowNull: false,
            validate: {
                notEmpty: true,
            }
        },
    },
    {
        sequelize
    }
);

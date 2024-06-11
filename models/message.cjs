'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Message extends Model {
        static associate(models) {
            // Define associations here
            Message.belongsTo(models.User, { as: 'sender', foreignKey: 'fromUserId' });
            Message.belongsTo(models.User, { as: 'receiver', foreignKey: 'toUserId' });
        }
    }

    Message.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        fromUserId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Users', // Make sure this matches the name of your Users table
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        toUserId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: 'Message',
        timestamps: true,
    });

    return Message;
};

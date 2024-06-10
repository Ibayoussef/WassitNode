'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('Users', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                allowNull: false,
                primaryKey: true,
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            email: {
                type: Sequelize.STRING,
                unique: true,
                allowNull: false,
            },
            phone: {
                type: Sequelize.STRING,
                unique: true,
                allowNull: false,
            },
            address: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            coords: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            profile_picture: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            email_verified_at: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            isVerified: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
                allowNull: false,
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            fcm_token: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            domain: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            role: {
                type: Sequelize.ENUM('admin', 'pro', 'client'),
                allowNull: false,
            },
            available: {
                type: Sequelize.BOOLEAN,
                defaultValue: true,
                allowNull: false,
            },
            solopreneur: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            password: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            remember_token: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW,
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW,
            },
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('Users');
    },
};

'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('project_user', {
            project_id: {
                type: Sequelize.UUID,
                references: {
                    model: 'Projects',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            pro_id: {
                type: Sequelize.UUID,
                references: {
                    model: 'Users',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.fn('now'),
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.fn('now'),
            }
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('project_user');
    }
};

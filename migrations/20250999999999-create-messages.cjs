module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('Messages', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
            },
            fromUserId: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'Users', // Ensure this matches the name of your Users table
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            toUserId: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'Users',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            content: {
                type: Sequelize.TEXT,
                allowNull: false,
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('Messages');
    },
};

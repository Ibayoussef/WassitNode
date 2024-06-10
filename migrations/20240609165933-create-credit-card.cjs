'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('CreditCards', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      card_provider: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Visa, MasterCard, etc.',
      },
      card_number: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      expiry_month: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          len: [2, 2],
        },
      },
      expiry_year: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          len: [4, 4],
        },
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
    await queryInterface.dropTable('CreditCards');
  }
};

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Analytics', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false,
        unique: true,
      },
      user_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      pro_user_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      project_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      income: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
      },
      client_projects: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      pro_projects: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      service_statistics: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Analytics');
  },
};

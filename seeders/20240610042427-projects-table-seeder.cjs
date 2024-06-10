'use strict';
const { v4: uuidv4 } = require('uuid');
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Fetch users with 'client' role
    const clients = await queryInterface.sequelize.query(
      `SELECT id, name FROM "Users" WHERE role = 'client';`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const projects = clients.map(client => ({
      id: uuidv4(),
      client_id: client.id,
      pro_id: null, // Assign a random 'pro' user or null if none available
      name: `Project for ${client.name}`,
      status: 'active',
      category: 'maid',
      price: 250, // Example price
      ar: `Description arabic for ${client.name}'s project`,
      fr: `Description french for ${client.name}'s project`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await queryInterface.bulkInsert('Projects', projects);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Projects', null, {});
  }
};

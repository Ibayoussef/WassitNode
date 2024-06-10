'use strict';

const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hashedPassword = await bcrypt.hash('Password123$', 10);

    const clientUser = {
      id: uuidv4(),
      name: 'Client User',
      email: 'client@example.com',
      phone: '1234567890',
      address: '123 Client Street',
      coords: '40.7128,-74.0060',
      profile_picture: null,
      email_verified_at: new Date(),
      description: 'A sample client user',
      role: 'client',
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const proCoords = [
      '35.711191,-5.918312',
      '35.724851,-5.899390',
      '35.732864,-5.895485',
      '35.738228,-5.875486',
      '35.744150,-5.863126',
      '35.748757,-5.867612',
      '35.752418,-5.859940',
      '35.762994,-5.826133',
      '35.760533,-5.802304',
      '35.766978,-5.801798',
      '35.775123,-5.807069',
      '35.776407,-5.776083',
      '35.784387,-5.761529',
      '35.790556,-5.738406',
      '35.794951,-5.710521',
      '35.798564,-5.698948',
      '35.807512,-5.681894',
      '35.813122,-5.660662',
      '35.819008,-5.644285',
      '35.825281,-5.634073',
      '35.833234,-5.629294',
    ];

    const proUsers = proCoords.map((coords, i) => ({
      id: uuidv4(),
      name: `Pro User ${i}`,
      email: `pro${i}@example.com`,
      phone: `098765432${i}`,
      address: `456 Pro Avenue ${i}`,
      coords,
      profile_picture: null,
      email_verified_at: new Date(),
      solopreneur: 'FOWQOEN123#',
      domain: 'maid',
      description: `A sample pro user ${i}`,
      role: 'pro',
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const adminUser = {
      id: uuidv4(),
      name: 'Admin User',
      email: 'admin@example.com',
      phone: '0987654300',
      address: '456 Admin Avenue',
      profile_picture: null,
      email_verified_at: new Date(),
      description: 'A sample admin user',
      role: 'admin',
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await queryInterface.bulkInsert('Users', [clientUser, ...proUsers, adminUser]);

    const wallets = [
      {
        id: uuidv4(),
        balance: 400,
        user_id: clientUser.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      ...proUsers.map((user) => ({
        id: uuidv4(),
        balance: 700,
        user_id: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    ];

    await queryInterface.bulkInsert('Wallets', wallets);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Wallets', null, {});
    await queryInterface.bulkDelete('Users', null, {});
  },
};

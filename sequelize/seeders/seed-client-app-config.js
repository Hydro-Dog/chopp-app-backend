'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      'client_app_config',
      [
        {
          id: process.env.DEFAULT_CONFIG_ID,
          freeDeliveryIncluded: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      { ignoreDuplicates: true }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('client_app_config', { id: Sequelize.literal('uuid_generate_v4()'), });
  },
};

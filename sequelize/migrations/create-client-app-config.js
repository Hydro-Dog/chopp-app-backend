'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Подключаем расширение UUID (PostgreSQL only)
    await queryInterface.sequelize.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    await queryInterface.createTable('client_app_config', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        allowNull: false,
        primaryKey: true,
      },
      averageDeliveryCost: Sequelize.FLOAT,
      freeDeliveryIncluded: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      freeDeliveryThreshold: Sequelize.FLOAT,
      openTime: Sequelize.STRING,
      closeTime: Sequelize.STRING,
      disabled: Sequelize.BOOLEAN,
      deliveryAndPaymentsVerbose: Sequelize.TEXT,
      publicOfferVerbose: Sequelize.TEXT,
      description: Sequelize.TEXT,
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('client_app_config');
  },
};

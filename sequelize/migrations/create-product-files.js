'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Подключаем расширение UUID (PostgreSQL only)
    await queryInterface.sequelize.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    await queryInterface.createTable('product_files', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
      productId: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        allowNull: true,
        references: {
          model: 'products',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      fileId: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        allowNull: false,
        references: {
          model: 'files',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('product_files');
  },
};

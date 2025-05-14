'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Подключаем расширение UUID (PostgreSQL only)
    await queryInterface.sequelize.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    await queryInterface.createTable('shopping_cart_items', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false,
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
      shoppingCartId: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        references: {
          model: 'shopping_carts',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      orderId: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        references: {
          model: 'orders',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('shopping_cart_items');
  },
};

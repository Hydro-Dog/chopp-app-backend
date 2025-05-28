'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      'products',
      [
        {
          id: process.env.DELIVERY_PRODUCT_ID,
          title: 'Доставка',
          description: 'Услуга доставки заказа',
          price: 0,
          state: 'PUBLISHED', // обязательно укажи валидное значение PRODUCT_STATE
          categoryId: null, // если это "системный" товар — можно оставить null
          imagesOrder: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      { ignoreDuplicates: true },
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('products', { id: process.env.DELIVERY_PRODUCT_ID });
  },
};

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      'roles',
      [
        {
          id: Sequelize.literal('uuid_generate_v4()'),
          value: 'ADMIN',
          description: 'Роль администратора',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: Sequelize.literal('uuid_generate_v4()'),
          value: 'USER',
          description: 'Роль пользователя',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      { ignoreDuplicates: true }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('roles', {
      id: { [Sequelize.Op.in]: [1, 2] },
    });
  },
};

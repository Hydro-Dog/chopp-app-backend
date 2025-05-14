'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Подключаем расширение UUID (PostgreSQL only)
    await queryInterface.sequelize.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    // Подключаем расширение UUID (PostgreSQL only)
    await queryInterface.sequelize.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      phoneNumber: { type: Sequelize.STRING, unique: true, allowNull: true },
      refreshToken: { type: Sequelize.STRING, unique: true },
      verificationCode: { type: Sequelize.STRING, allowNull: true },
      verificationExpires: { type: Sequelize.DATE, allowNull: true },
      verificationAttempts: { type: Sequelize.INTEGER, defaultValue: 0 },
      isRegistered: { type: Sequelize.BOOLEAN, defaultValue: true },
      telegramUserId: { type: Sequelize.STRING, allowNull: true },
      email: { type: Sequelize.STRING, unique: true, allowNull: true },
      password: { type: Sequelize.STRING, allowNull: true },
      fullName: { type: Sequelize.STRING, allowNull: true },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('users');
  },
};

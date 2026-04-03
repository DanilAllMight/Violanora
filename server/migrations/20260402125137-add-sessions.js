"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("sessions", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users", // Убедись, что таблица юзеров называется именно так
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      refreshToken: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      deviceInfo: {
        type: Sequelize.STRING,
        allowNull: true, // Здесь будем хранить "Chrome on Windows" и т.д.
      },
      ipAddress: {
        type: Sequelize.STRING(45),
        allowNull: true,
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("NOW()"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("NOW()"),
      },
    });

    // Добавляем индекс по токену для быстрого поиска при обновлении (Refresh)
    await queryInterface.addIndex("sessions", ["refreshToken"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("sessions");
  },
};

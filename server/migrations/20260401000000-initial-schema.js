"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Создаем таблицу users
    await queryInterface.createTable("users", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      email: { type: Sequelize.STRING, unique: true, allowNull: false },
      hashpassword: { type: Sequelize.STRING, allowNull: false },
      username: { type: Sequelize.STRING, allowNull: false, unique: true },
      avatar_url: { type: Sequelize.TEXT, allowNull: true },
      fcmToken: { type: Sequelize.STRING, allowNull: true },
      online_time: { type: Sequelize.DATE, allowNull: true },
      role: { type: Sequelize.TEXT, allowNull: false, defaultValue: "USER" },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
      deletedAt: { type: Sequelize.DATE, allowNull: true },
    });

    // 2. Создаем таблицу sessions
    await queryInterface.createTable("sessions", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      refreshToken: { type: Sequelize.TEXT, allowNull: false },
      deviceInfo: { type: Sequelize.STRING, allowNull: true },
      ipAddress: { type: Sequelize.STRING(45), allowNull: true },
      expiresAt: { type: Sequelize.DATE, allowNull: false },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
    });

    // 3. Создаем таблицу user_subscriptions
    await queryInterface.createTable("user_subscriptions", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      userId: { type: Sequelize.INTEGER, allowNull: false, unique: true },
      subscription: { type: Sequelize.JSONB, allowNull: false },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("user_subscriptions");
    await queryInterface.dropTable("sessions");
    await queryInterface.dropTable("users");
  },
};

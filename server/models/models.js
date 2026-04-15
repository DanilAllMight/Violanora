const { DataTypes } = require("sequelize");

const sequelize = require("../config/db.js");

const User = sequelize.define(
  "user",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING,
      unique: true, // Чтобы не было дублей
      allowNull: false, // Обязательное поле
      validate: { isEmail: true }, // Валидация формата
    },
    hashpassword: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    avatar_url: {
      type: DataTypes.TEXT, // Используем TEXT, так как ссылка может быть длинной
      allowNull: true, // По умолчанию у пользователя может не быть аватара
    },
    fcmToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    online_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    role: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "USER",
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true, // По умолчанию null, пока юзер не удален
    },
  },
  {
    timestamps: true, // Включает createdAt и updatedAt
    paranoid: true, // Включает логику Soft Delete (использует поле deletedAt)
  },
);

const Session = sequelize.define(
  "session",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users", // Имя таблицы юзеров
        key: "id",
      },
    },
    refreshToken: {
      type: DataTypes.TEXT, // Используем TEXT для длинных JWT
      allowNull: false,
    },
    deviceInfo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ipAddress: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    // Настройки модели
    tableName: "sessions",
    timestamps: true, // Создаст updatedAt и createdAt автоматически
  },
);

const PushSubscription = sequelize.define(
  "pushsubscription",
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true, // Чтобы у одного юзера была одна запись
    },
    subscription: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
  },
  {
    tableName: "user_subscriptions",
  },
);

module.exports = { User, Session, PushSubscription };

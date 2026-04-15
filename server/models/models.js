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
      unique: true,
      allowNull: false,
      validate: { isEmail: true },
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
      type: DataTypes.TEXT,
      allowNull: true,
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
      allowNull: true,
    },
  },
  {
    timestamps: true,
    paranoid: true,
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
        model: "users",
        key: "id",
      },
    },
    refreshToken: {
      type: DataTypes.TEXT,
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
    timestamps: true,
  },
);

const PushSubscription = sequelize.define(
  "pushsubscription",
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
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

const { DataTypes } = require("sequelize");

const sequelize = require("../config/db.js");

const User = sequelize.define("user", {
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
});

module.exports = { User };

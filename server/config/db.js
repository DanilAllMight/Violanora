const { Sequelize } = require("sequelize");

const connectionString =
  process.env.DATABASE_URL ||
  "postgres://postgres:All_Might@localhost:5432/real-time-chat";

const sequelize = new Sequelize(connectionString, {
  dialect: "postgres",
  logging: false, // Отключаем логи в консоли, чтобы не спамить (по желанию)
  dialectOptions: {
    ssl: false,
  },
});

module.exports = sequelize;

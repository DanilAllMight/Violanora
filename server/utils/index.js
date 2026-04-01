const sequelize = require("../config/db");

async function initDB() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: false, force: false });

    console.log("Success");
  } catch (err) {
    console.error(err);
  }
}

module.exports = initDB;

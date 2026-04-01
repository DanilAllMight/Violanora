const mongoose = require("mongoose");
require("dotenv").config();

const mongoURI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/real-time-chat";

async function connectDB() {
  try {
    console.log("ENV ", process.env.MONGODB_URI);
    await mongoose.connect(mongoURI);
    console.log("✅ Локальная MongoDB успешно подключена");
  } catch (err) {
    console.error("❌ Ошибка подключения:", err.message);
    process.exit(1);
  }
}

module.exports = connectDB;

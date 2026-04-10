require("dotenv").config();

const config = {
  mongodb: {
    url: process.env.MONGO_URI,
    databaseName: "chat_messages_db",
  },
  // Переименуйте папку здесь, например в migrations-mongo
  migrationsDir: "migrations-mongo",
  changelogCollectionName: "migrations_changelog",
  migrationFileExtension: ".js",
  useFileHash: false,
};

module.exports = config;

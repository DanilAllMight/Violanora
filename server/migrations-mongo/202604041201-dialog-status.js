module.exports = {
  async up(db, client) {
    // Обновляем все диалоги, где есть lastMessage, но нет поля status
    await db.collection("dialogs").updateMany(
      {
        lastMessage: { $exists: true },
        "lastMessage.status": { $exists: false },
      },
      {
        $set: { "lastMessage.status": "sent" },
      },
    );
  },

  async down(db, client) {
    // При откате миграции удаляем поле status из lastMessage
    await db
      .collection("dialogs")
      .updateMany(
        { "lastMessage.status": { $exists: true } },
        { $unset: { "lastMessage.status": "" } },
      );
  },
};

module.exports = {
  async up(db, client) {
    // Добавляем статус "sent" всем сообщениям, у которых его еще нет
    await db
      .collection("messages")
      .updateMany({ status: { $exists: false } }, { $set: { status: "sent" } });
  },

  async down(db, client) {
    // Удаляем поле status, если нужно откатиться
    await db.collection("messages").updateMany({}, { $unset: { status: "" } });
  },
};

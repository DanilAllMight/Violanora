module.exports = {
  async up(db, client) {
    // Добавляем статус "sent" всем сообщениям, у которых его еще нет
    await db
      .collection("messages")
      .updateMany({ status: { $exists: false } }, { $set: { status: "sent" } });
    console.log("Поле status успешно добавлено старым сообщениям");
  },

  async down(db, client) {
    // Удаляем поле status, если нужно откатиться
    await db.collection("messages").updateMany({}, { $unset: { status: "" } });
    console.log("Поле status удалено");
  },
};

module.exports = {
  async up(db, client) {
    // Добавляем пустой массив attachments всем старым сообщениям, где его нет
    await db
      .collection("messages")
      .updateMany(
        { attachments: { $exists: false } },
        { $set: { attachments: [] } },
      );
  },

  async down(db, client) {
    // Откат: удаляем поле attachments
    await db
      .collection("messages")
      .updateMany({}, { $unset: { attachments: "" } });
  },
};

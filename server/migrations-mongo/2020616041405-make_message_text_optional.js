module.exports = {
  async up(db, client) {
    // Устанавливаем пустую строку всем сообщениям, где текст вдруг null или отсутствует
    await db
      .collection("messages")
      .updateMany({ text: { $exists: false } }, { $set: { text: "" } });

    // Также на всякий случай проверяем записи, где текст явно null
    await db
      .collection("messages")
      .updateMany({ text: null }, { $set: { text: "" } });
  },

  async down(db, client) {
    // Обычно откат для необязательного поля не требуется,
    // но если нужно вернуть strict mode, можно оставить пустым
  },
};

module.exports = {
  async up(db, client) {
    // 1. Убираем null значения, если они есть
    await db
      .collection("messages")
      .updateMany({ text: null }, { $set: { text: "" } });

    // 2. Добавляем поле text тем сообщениям, где его вообще нет
    await db
      .collection("messages")
      .updateMany({ text: { $exists: false } }, { $set: { text: "" } });
  },

  async down(db, client) {
    // В down можно ничего не делать, так как мы просто нормализовали данные
  },
};

module.exports = function (roles) {
  return function (req, res, next) {
    try {
      console.log("ROLE MIDDLEWARE 1", req.user);
      // 1. Проверяем, есть ли данные о пользователе (которые положил authMiddleware)
      if (!req.user) {
        return res.status(401).json({ message: "Пользователь не авторизован" });
      }

      console.log("ROLE MIDDLEWARE ", req.user);

      // 2. Достаем роль из userData (убедись, что при создании токена ты записывал туда role)
      const role = req.role;

      // 3. Проверяем, входит ли роль пользователя в список разрешенных
      if (!roles.includes(role)) {
        return res.status(403).json({ message: "У вас нет прав доступа" });
      }

      next(); // Все хорошо, пропускаем дальше
    } catch (e) {
      return res.status(403).json({ message: "Ошибка доступа" });
    }
  };
};

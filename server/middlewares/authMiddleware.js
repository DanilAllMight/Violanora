const { User } = require("../models/models");
const tokenService = require("../services/token-service");

const getUserRole = async (userData) => {
  const user = await User.findOne({ where: { id: userData.id } });
  return user ? user.role : "USER";
};

module.exports = async function (req, res, next) {
  try {
    console.log("AUTH MIDDLEWARE");
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
      return res.status(401).json({ message: "Пользователь не авторизован" });
    }

    const accessToken = authorizationHeader.split(" ")[1]; // Достаем 'Bearer TOKEN'
    if (!accessToken) {
      return res.status(401).json({ message: "Пользователь не авторизован" });
    }

    const userData = tokenService.validateAccessToken(accessToken);
    if (!userData) {
      return res
        .status(401)
        .json({ message: "Токен недействителен или просрочен" });
    }

    // Записываем данные юзера в запрос, чтобы использовать в контроллерах
    const role = await getUserRole(userData);
    req.role = role;
    req.user = userData;
    console.log("AUTH MIDDLE USER ROLE ", req.role, " ", userData);
    next(); // Идем дальше к контроллеру
  } catch (e) {
    console.log("AUTH MIDDLEWARE error");
    return res.status(401).json({ message: "Пользователь не авторизован" });
  }
};

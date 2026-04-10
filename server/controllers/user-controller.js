const { User, Session } = require("../models/models");
const bcrypt = require("bcrypt");
const sharp = require("sharp");
const { supabase } = require("../utils/supabase");
const tokenService = require("../services/token-service");
const logger = require("../utils/logger");

class UserController {
  async registration(req, res) {
    console.log("UserController :: registration() :: req.body", req.body);
    const { email, password, username } = req.body;

    const hashPassword = await bcrypt.hash(password, 10);

    const candidate = await User.findOne({ where: { email: email } });

    if (candidate) {
      return res.status(400).json({
        message: "Пользователь с таким email уже существует",
      });
    }

    const candidateName = await User.findOne({ where: { username: username } });

    if (candidateName) {
      return res.status(400).json({
        message: "Пользователь с таким username уже существует",
      });
    }

    try {
      const user = await User.create({
        email: email,
        hashpassword: hashPassword,
        username: username,
      });
      console.log("UserController :: registration :: Пользователь создан!");

      const tokens = tokenService.generateTokens({
        id: user.id,
        email: user.email,
      });

      await tokenService.saveSession(
        user.id,
        tokens.refreshToken,
        req.headers["user-agent"],
        req.ip,
      );

      const data = {
        user: {
          id: user.id,
          access_token: tokens.accessToken,
          refresh_token: tokens.refreshToken,
          username: username,
          email: email,
        },
      };

      res.cookie("refreshToken", tokens.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });
      res.json(data);
    } catch (error) {
      return res.status(500).json({
        message: "Пользователь не создан!",
      });
    }
  }

  async login(req, res) {
    console.log("UserController :: login :: req.body ", req.body);

    const { email, password } = req.body;

    const candidate = await User.findOne({ where: { email: email } });

    if (!candidate) {
      return res.status(404).json({
        message: "Пользователя с таким Email не существует!",
      });
    }

    const comp = await bcrypt.compare(password, candidate.hashpassword);

    if (!comp) {
      return res.status(400).json({
        message: "Неверный пароль!",
      });
    }

    const tokens = tokenService.generateTokens({
      id: candidate.id,
      email: candidate.email,
    });

    await tokenService.saveSession(
      candidate.id,
      tokens.refreshToken,
      req.headers["user-agent"],
      req.ip,
    );

    console.log("UserController :: login :: Пользователь вошёл!");

    const data = {
      user: {
        id: candidate.id,
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
        email: email,
        username: candidate.username,
        avatar_url: candidate.avatar_url,
      },
    };
    res.cookie("refreshToken", tokens.refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    res.json(data);
  }

  async getUsers(req, res) {
    try {
      console.log("UserController :: getUsers");
      const users = await User.findAndCountAll({
        attributes: ["id", "email", "username", "avatar_url", "online_time"],
      });
      //console.log("users ", users);
      const data = { users: users.rows, count: users.count };
      return res.json(data);
    } catch (err) {
      return res.status(500).json({
        message: "Ошибка получения списка пользователей!",
      });
    }
  }

  async uploadAvatar(req, res) {
    try {
      const file = req.file;
      const { userId } = req.body;

      if (!file) return res.status(400).json({ error: "Файл не выбран" });

      // --- 1. НАХОДИМ ТЕКУЩЕГО ПОЛЬЗОВАТЕЛЯ И СТАРЫЙ АВАТАР ---
      const user = await User.findByPk(userId);
      if (!user)
        return res.status(404).json({ error: "Пользователь не найден" });

      const oldAvatarUrl = user.avatar_url;

      // 2. Сжимаем новую картинку
      const buffer = await sharp(file.buffer)
        .resize(400, 400, { fit: "cover" })
        .webp({ quality: 80 })
        .toBuffer();

      const fileName = `avatars/${userId}-${Date.now()}.webp`;

      // --- 3. УДАЛЯЕМ СТАРЫЙ ФАЙЛ ИЗ STORAGE (если он есть) ---
      if (oldAvatarUrl) {
        try {
          // Извлекаем путь после названия бакета (все, что после /avatar_images/)
          // Пример URL: .../storage/v1/object/public/avatar_images/avatars/1-123.webp
          const pathParts = oldAvatarUrl.split("avatar_images/");
          if (pathParts.length > 1) {
            const oldFilePath = pathParts[1];
            await supabase.storage.from("avatar_images").remove([oldFilePath]);
            console.log("Старый файл удален из хранилища:", oldFilePath);
          }
        } catch (removeErr) {
          // Ошибку удаления не "кидаем" дальше, чтобы не прерывать загрузку новой авы
          console.error(
            "Ошибка при удалении старого файла:",
            removeErr.message,
          );
        }
      }

      // 4. Загружаем новый файл в Supabase
      const { data, error } = await supabase.storage
        .from("avatar_images")
        .upload(fileName, buffer, {
          contentType: "image/webp",
          upsert: true,
        });

      if (error) throw error;

      // 5. Получаем публичную ссылку
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatar_images").getPublicUrl(fileName);

      // 6. Обновляем запись в PostgreSQL
      await User.update({ avatar_url: publicUrl }, { where: { id: userId } });

      res.json({
        message: "Аватар успешно обновлен",
        url: publicUrl,
      });
    } catch (err) {
      console.error("Ошибка загрузки аватара:", err);
      res.status(500).json({ error: "Ошибка при загрузке аватара" });
    }
  }

  // Контроллер пользователя
  async updateFcmToken(req, res) {
    try {
      const { userId, token } = req.body;

      console.log("UPDATE FCM USER ID ", userId);

      if (!userId) {
        return res.status(400).json({ message: "ID пользователя обязателен" });
      }

      // Обновляем запись в PostgreSQL через вашу модель User
      // Убедитесь, что миграция с полем fcmToken уже выполнена
      await User.update({ fcmToken: token }, { where: { id: userId } });

      console.log(`✅ Токен обновлен для пользователя ${userId}`);
      return res.status(200).json({ message: "Токен успешно обновлен" });
    } catch (error) {
      console.error("Ошибка при обновлении FCM токена:", error);
      return res
        .status(500)
        .json({ error: "Ошибка сервера при сохранении токена" });
    }
  }

  async updateUserData(req, res) {
    const { userId, data } = req.body;

    console.log("data, ", data);

    const user = await User.update(
      { username: data.username },
      { where: { id: userId } },
    );

    if (user) {
      const usr = { user: { username: data.username } };
      console.log("username ", usr);
      res.json(usr);
    } else {
      res.status(400).json("Ошибка в данных");
    }
  }

  async refresh(req, res) {
    try {
      // 1. Достаем refreshToken из кук
      const { refreshToken } = req.cookies;

      if (!refreshToken) {
        return res.status(401).json({ message: "Токен отсутствует" });
      }

      // 2. Валидируем токен через сервис
      const userData = tokenService.validateRefreshToken(refreshToken);
      // 3. Проверяем наличие этой сессии в БД
      const tokenFromDb = await Session.findOne({ where: { refreshToken } });

      if (!userData || !tokenFromDb) {
        return res
          .status(401)
          .json({ message: "Сессия не найдена или просрочена" });
      }

      // 4. Находим пользователя и создаем новые токены
      const user = await User.findByPk(userData.id);
      const tokens = tokenService.generateTokens({
        id: user.id,
        email: user.email,
      });

      // 5. Обновляем refreshToken в базе данных (старую сессию заменяем новой)
      tokenFromDb.refreshToken = tokens.refreshToken;
      await tokenFromDb.save();

      // 6. Устанавливаем новую куку и отдаем данные
      res.cookie("refreshToken", tokens.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });

      // Возвращаем данные в том формате, который ожидает твой клиент
      return res.json({
        user: {
          id: user.id,
          access_token: tokens.accessToken,
          refresh_token: tokens.refreshToken,
          username: user.username,
          email: user.email,
        },
      });
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: "Ошибка авторизации" });
    }
  }

  async logout(req, res) {
    try {
      // 1. Извлекаем Refresh Token из кук
      const { refreshToken } = req.cookies;

      console.log("LOGOUT ", refreshToken);
      logger.debug("LOGOUT");

      if (refreshToken) {
        // 2. Удаляем сессию из таблицы в БД
        await Session.destroy({ where: { refreshToken } });
      }

      // 3. Очищаем куку в браузере
      // Важно: параметры (httpOnly) должны совпадать с теми, что были при установке
      res.clearCookie("refreshToken", {
        httpOnly: true,
        // secure: true, // раскомментируй, если используешь https
      });

      return res.status(200).json({ message: "Вы успешно вышли из системы" });
    } catch (error) {
      console.error("Ошибка при выходе:", error);
      return res.status(500).json({ message: "Произошла ошибка при выходе" });
    }
  }
}

module.exports = new UserController();

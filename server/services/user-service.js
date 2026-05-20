const errorMessages = require("../constants/errorMessages");
const { User, Session } = require("../models/models");
const userRepository = require("../repositories/user-repository");
const AppError = require("../utils/appError");
const logger = require("../utils/logger");
const { PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { s3Client } = require("../utils/s3");
require("dotenv").config();
const sharp = require("sharp");

class UserService {
  async getUsers() {
    logger.debug("Получение пользователей");
    const users = await userRepository.getAllPublicData();
    const data = { users: users.rows, count: users.count };
    logger.debug(data, "Пользователи получены");
    return data;
  }

  async getUsersForAdmin(isAdmin) {
    logger.debug("Получение пользователей для администратора");
    const users = await userRepository.getAllForAdmin();

    const data = { users: users.rows, count: users.count };
    logger.debug(data, "Получены пользователи для администратора");
    return data;
  }

  /*async uploadAvatar(userId, file) {
    logger.debug("Обновление аватара");
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError(errorMessages.USER_NOT_EXISTS, 404);

    const oldAvatarUrl = user.avatar_url;

    const buffer = await sharp(file.buffer)
      .resize(400, 400, { fit: "cover" })
      .webp({ quality: 80 })
      .toBuffer();

    const fileName = `avatars/${userId}-${Date.now()}.webp`;

    if (oldAvatarUrl) {
      const pathParts = oldAvatarUrl.split("avatar_images/");
      if (pathParts.length > 1) {
        const oldFilePath = pathParts[1];
        await supabase.storage.from("avatar_images").remove([oldFilePath]);
      }
    }

    const { data, error } = await supabase.storage
      .from("avatar_images")
      .upload(fileName, buffer, {
        contentType: "image/webp",
        upsert: true,
      });

    if (error) throw error;

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatar_images").getPublicUrl(fileName);

    const update_data = { avatar_url: publicUrl };

    await userRepository.update(userId, update_data);

    logger.debug(publicUrl, "Аватар успешно обновлён");

    return {
      message: "Аватар успешно обновлен",
      url: publicUrl,
    };
  }*/

  async uploadAvatar(userId, file) {
    logger.debug("Обновление аватара");
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError(errorMessages.USER_NOT_EXISTS, 404);

    const oldAvatarUrl = user.avatar_url;

    const buffer = await sharp(file.buffer)
      .resize(400, 400, { fit: "cover" })
      .webp({ quality: 80 })
      .toBuffer();

    const fileName = `avatars/${userId}-${Date.now()}.webp`;

    if (oldAvatarUrl && oldAvatarUrl.includes(process.env.CDN_URL)) {
      try {
        const oldFileKey = oldAvatarUrl.replace(`${process.env.CDN_URL}/`, "");

        await s3Client.send(
          new DeleteObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: oldFileKey,
          }),
        );
        logger.debug("Старый аватар успешно удален из Timeweb S3");
      } catch (deleteError) {
        logger.error("Не удалось удалить старый аватар из S3:", deleteError);
      }
    }

    try {
      await s3Client.send(
        new PutObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: fileName,
          Body: buffer,
          ContentType: "image/webp",
        }),
      );
    } catch (uploadError) {
      logger.error("Ошибка при отправке файла в Timeweb S3:", uploadError);
      throw new AppError("Ошибка при сохранении файла в облако", 500);
    }

    const publicUrl = `${process.env.CDN_URL}/${fileName}`;

    const update_data = { avatar_url: publicUrl };
    await userRepository.update(userId, update_data);

    logger.debug(publicUrl, "Аватар успешно обновлён");

    return {
      message: "Аватар успешно обновлен",
      url: publicUrl,
    };
  }

  async updateUserData(userId, data) {
    logger.debug("Обновление данных пользователя");
    const user = await userRepository.update(userId, { username });

    if (user) {
      const usr = { username: data.username };
      logger.debug(usr, "Данные успешно обновлены");
      return usr;
    } else {
      throw new AppError(errorMessages.NOT_VALIDE_DATA, 404);
    }
  }

  async deleteUser() {
    logger.debug("Удаление пользователя");
    const user = await userRepository.delete({ where: { id: userId } });

    if (user === 0) {
      throw new AppError(errorMessages.USER_NOT_EXISTS, 404);
    }

    await sessionRepository.deleteAllByUserId(userId);
    logger.debug("Пользователь успешно удалён");
  }

  async reliveUser(userId) {
    logger.debug("Восстановление пользователя");
    const user = await userRepository.findById(userId, { paranoid: false });

    if (!user) {
      throw new AppError(errorMessages.USER_NOT_EXISTS, 404);
    }

    await user.restore();

    logger.debug("Успешное восстановление пользователя");

    return user;
  }
}

module.exports = new UserService();

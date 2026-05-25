const { User, Session } = require("../models/models");
const bcrypt = require("bcrypt");
const sharp = require("sharp");
const { supabase } = require("../utils/s3");
const tokenService = require("../services/token-service");
const logger = require("../utils/logger");
const { where } = require("sequelize");
const UserService = require("../services/user-service");
const GetUsersResponseDto = require("../dtos/user/getUsers.response.dto");
const GetUsersForAdminResponseDto = require("../dtos/user/getUsersForAdmin.response.dto");
const UploadAvatarRequestDto = require("../dtos/user/uploadAvatar.request.dto");
const UploadAvatarResponseDto = require("../dtos/user/uploadAvatar.response.dto");
const UpdateUserDataRequest = require("../dtos/user/updateUserData.request.dto");
const DeleteUserRequest = require("../dtos/user/deleteUser.request.dto");
const ReliveUserRequest = require("../dtos/user/reliveUser.request.dto");
const UpdateUserDataResponse = require("../dtos/user/updateUserData.response.dto");
const DeleteUserResponse = require("../dtos/user/deleteUser.response.dto");
const ReliveUserResponse = require("../dtos/user/reliveUser.response.dto");
const catchAsync = require("../utils/catchAsync");
const GetUserDataResponse = require("../dtos/user/getUserData.response");

class UserController {
  async getUsers(req, res, next) {
    logger.info("Пользователь запросил список пользователей");
    const usersData = await UserService.getUsers();

    const data = new GetUsersResponseDto(usersData);

    logger.debug("Возврат пользователю пользователей");

    return res.json(data);
  }

  async getUsersForAdmin(req, res, next) {
    logger.info(
      "Пользователь запросил список пользователей для администратора",
    );
    const isAdmin = req.role === "ADMIN";

    const usersData = await UserService.getUsersForAdmin(isAdmin);

    const data = new GetUsersForAdminResponseDto(usersData);

    logger.debug("Возврат пользователю пользователей для администратора");

    return res.json(data);
  }

  async uploadAvatar(req, res, next) {
    const requestDto = new UploadAvatarRequestDto(req.body, req.file);

    logger.info("Пользователь обновляет аватар");

    if (!requestDto.file)
      return res.status(400).json({ error: "Файл не выбран" });

    const userData = await UserService.uploadAvatar(
      requestDto.userId,
      requestDto.file,
    );

    const data = new UploadAvatarResponseDto(userData);

    logger.debug("Возращаем пользователю даннеы после обновлвения аватара");

    return res.json(data);
  }

  async updateUserData(req, res, next) {
    const requestDto = new UpdateUserDataRequest(req.body);

    logger.info(requestDto, "Пользователь обновляет данные");

    const userData = await UserService.updateUserData(
      requestDto.userId,
      requestDto.data,
    );

    const user = new UpdateUserDataResponse(userData);

    logger.debug(user, "Возвращаем пользователю обновлённые данные");

    return res.json(user);
  }

  async deleteUser(req, res, next) {
    const requestDto = DeleteUserRequest(req.body);

    logger.info(requestDto, "Администратор хочет удалить пользователя");

    await UserService.deleteUser(requestDto.userId);

    const responseDto = new DeleteUserResponse(requestDto.userId);

    logger.debug(
      responseDto,
      "Возвращаем администратору данные о пользователе",
    );

    return res.json({
      message: "Пользователь успешно удален",
      id: responseDto,
    });
  }

  async reliveUser(req, res, next) {
    const requestDto = ReliveUserRequest(req.body);

    logger.info(requestDto, "Администратор восстанавливает пользователя");

    const userData = await UserService.reliveUser(requestDto.userId);

    const user = new ReliveUserResponse(userData);

    logger.debug(
      user,
      "Возвращаем администратору данные о восстановленном пользователе",
    );

    return res.json({
      message: "Пользователь успешно восстановлен",
      user: user,
    });
  }

  async getUserData(req, res, next) {
    const { userId } = req.params;

    logger.info(userId, "Пользователь запросил данные о пользователе");

    const userData = await UserService.getUserData(userId);

    const user = new GetUserDataResponse(userData);

    return res.json(user);
  }
}

module.exports = new UserController();

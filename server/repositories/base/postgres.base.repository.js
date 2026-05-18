const logger = require("../../utils/logger");

class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async findOne(options) {
    logger.debug("Ищем одно в postgres");
    return await this.model.findOne(options);
  }

  async findById(id) {
    logger.debug("Ищем по id в postgres");
    return await this.model.findByPk(id);
  }

  async create(data) {
    logger.debug("Создаём запись в postgres");
    return await this.model.create(data);
  }

  async update(id, data) {
    logger.debug("Обновляем запись в postgres");
    const entity = await this.findById(id);
    if (entity) {
      logger.debug("Обновляем");
      return await entity.update(data);
    }
    return null;
  }

  async delete(options) {
    logger.debug({ options: options }, "Удаляем запись в postgres");
    return await this.model.destroy(options);
  }

  async findAndCountAll(options) {
    logger.debug("Ищем и считаем всё в postgres");
    return await this.model.findAndCountAll(options);
  }

  async restore(options) {
    logger.debug("Пересохраняем в postgres");
    return await this.model.restore(options);
  }

  async findAll(options) {
    logger.debug("Ищем всё в postgres");
    return await this.model.findAll(options);
  }
}

module.exports = BaseRepository;

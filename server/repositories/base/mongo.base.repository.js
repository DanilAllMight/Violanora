const logger = require("../../utils/logger");

class MongoBaseRepository {
  constructor(model) {
    this.model = model;
  }

  async find(filter, sort = { updatedAt: -1 }) {
    logger.debug("Ищем в mongo");
    return await this.model.find(filter).sort(sort).lean();
  }

  async findOne(data) {
    logger.debug("Ищём одно в монго");
    return await this.model.findOne(data).lean();
  }

  async findById(id) {
    logger.debug("Ищём в монго по id");
    return await this.model.findById(id);
  }

  async findMany(query = {}, { sort = { createdAt: -1 }, limit = 50 } = {}) {
    logger.debug("Поиск списка документов в монго");
    return await this.model.find(query).sort(sort).limit(Number(limit)).lean();
  }

  async create(data) {
    logger.debug("Создаём документ в монго");
    return await this.model.create(data);
  }

  async findByIdAndUpdate(id, data, options = { new: true }) {
    logger.debug("Ищём по id и обновляем в монго");
    return await this.model.findByIdAndUpdate(id, data, options);
  }

  async findOneAndUpdate(filter, updateData) {
    logger.debug({ filter }, "Ищем один и обновляем в монго");

    const data = await this.model.findOneAndUpdate(filter, updateData, {
      upsert: true,
      new: true,
    });

    return data;
  }

  async updateMany(filter, updateData) {
    logger.debug({ filter }, "Множественное обновление");

    const result = await this.model.updateMany(filter, updateData);

    return result;
  }
}

module.exports = MongoBaseRepository;

const rateLimit = require("express-rate-limit");

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Слишком много запросов. Попробуйте позже." },
  standardHeaders: true,
  legacyHeaders: false,
});

const chatMessageLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 минута
  max: 5, // не более 5 сообщений
  message: { error: "Вы пишете слишком часто. Подождите 1 минуту." },
});

module.exports = {
  generalLimiter,
  chatMessageLimiter,
};

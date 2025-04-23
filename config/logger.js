// config/logger.js
const winston = require('winston');

// Налаштування формату виведення логів
const logFormat = winston.format.printf(({ timestamp, level, message }) => {
  return `${timestamp} ${level}: ${message}`;
});

// Створення екземпляру логгера
const logger = winston.createLogger({
  level: 'info', // Мінімальний рівень логування
  format: winston.format.combine(
    winston.format.timestamp(),
    logFormat
  ),
  transports: [
    // Логування в консоль
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(), // Додає кольори виводу в консоль
        winston.format.simple()    // Простий формат
      )
    }),
    // Логування в файл
    new winston.transports.File({
      filename: 'logs/app.log',  // Файл для зберігання логів
      level: 'info'              // Зберігаємо всі логи від рівня info і вище
    })
  ],
});

module.exports = logger;

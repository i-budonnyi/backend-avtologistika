const fs = require('fs');
const path = require('path');
const sequelize = require('../config/database');

const models = {};

// Автоматично завантажуємо всі моделі (без зв’язків)
['blog', 'users'].forEach(folder => {
  fs.readdirSync(path.join(__dirname, folder))
    .filter(file => file.endsWith('.js') && file !== 'relations.js')
    .forEach(file => {
      const model = require(path.join(__dirname, folder, file));
      models[model.name] = model;
    });
});

// Автоматично завантажуємо файли зв’язків
['blog', 'users'].forEach(folder => {
  const relationFile = path.join(__dirname, '..', 'models', 'relations', `${folder}Relations.js`);
  if (fs.existsSync(relationFile)) {
    require(relationFile)(models);
  }
});

models.sequelize = sequelize;
models.Sequelize = require('sequelize');

module.exports = models;

require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'Pmzpolska2024',
    database: process.env.DB_NAME || 'avtologistika',
    host: process.env.DB_HOST || '192.168.0.116',
    dialect: 'postgres',
  },
  production: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'Pmzpolska2024',
    database: process.env.DB_NAME || 'avtologistika',
    host: process.env.DB_HOST || '192.168.0.116',
    dialect: 'postgres',
  },
};

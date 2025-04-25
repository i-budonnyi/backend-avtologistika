require('dotenv').config();

module.exports = {
  development: {
    username: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
    host: process.env.PG_HOST, // має бути 'idea-backend-db' у .env
    port: process.env.PG_PORT,
    dialect: 'postgres',
  },
  production: {
    username: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
    host: process.env.PG_HOST, // має бути 'idea-backend-db' у .env
    port: process.env.PG_PORT,
    dialect: 'postgres',
  },
};

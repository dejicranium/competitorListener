var mysql = require("mysql2/promise");
const util = require("util");

module.exports = async () => {
  let connection = await mysql.createConnection({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
  });

  return connection;
};

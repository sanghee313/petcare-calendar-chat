const maria = require("mysql2");

const conn = maria.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "gnwhddldi2!",
  database: "petcare",
});
console.log("maria.db 연동");

module.exports = conn;

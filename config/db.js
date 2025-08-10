const mysql = require('mysql2');

const MySQLConnection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: 'explore_bharat'
});

MySQLConnection.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL database.");
});

module.exports = MySQLConnection;
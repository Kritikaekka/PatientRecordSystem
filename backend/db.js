const mysql = require('mysql2');
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Simmi@rimmi4', 
  database: 'HospitalPatientDB' 
});
module.exports = connection;

const mysql = require('mysql'); 
const dotenv = require('dotenv');
dotenv.config(); 

// Configuration de la connexion à la base de données
const connection = mysql.createConnection({
    host: process.env.HOST, 
    user: "Meii",
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
});

// Connexion à la base de données
connection.connect((err) => {
    if (err) throw err;
    console.log('BDD OK');
});

module.exports = connection;

const {client} = require('pg');

const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'user',
    database: 'postgres'
});

module.exports = client;


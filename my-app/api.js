import client from './connection.js';

const express = require('express');
const app = express();

app.listen(3300, () => {
    console.log('Server is running on port 3000');
});
client.connect();

const bodyParser = require("body-parser");
app.use(bodyParser.json());

app.get('/users', (req, res)=>{
    client.query(`Select * from users`, (err, result)=>{
        if(!err){
            res.send(result.rows);
        }
    });
    client.end;
})
client.connect();

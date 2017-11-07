const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
const db = require('./config/db');
const cors = require('cors')
const app = express();

// start listenting for requests
const port = 8000;

app.use(cors({
    "origin": ["http://localhost:4200", "https://www.samgriffen.com", "https://samgriffen.com"],
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    "preflightContinue": false,
    "optionsSuccessStatus": 204,
    "credentials": true
}));

app.use(bodyParser.urlencoded({ extended: true }));
// for parsing form encoded data and what not

MongoClient.connect(db.url, (err, database) => {
    require('./app/routes') (app, database);

    app.listen(port, () => {
        console.log('We are live on: ' + port);
    });
});

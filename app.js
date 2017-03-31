var express = require('express'),
    mysql = require('mysql'),
    bodyParser = require('body-parser'),
    app = express();

var port = process.env.PORT;

var dburl = process.env.CLEARDB_DATABASE_URL.replace('mysql://',"").replace('?reconnect=true','');

var pool = mysql.createPool({
    connectionLimit: 5,
    host: dburl.split('@')[1].split('/')[0],
    user: dburl.split('@')[0].split(':')[0],
    password: dburl.split('@')[0].split(':')[1],
    database: dburl.split('@')[1].split('/')[1]
});

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(function (req, res, next) { // allow all origins
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/getAffiliates', function (req, res) {
    pool.getConnection(function (err, connection) {
        if (err) {
            console.error("Could not get connection from pool");
            console.error(err);
        } else {
            connection.query("SELECT domain,percentage,affLink,storeName,type FROM aff", function (err, results) {
                if (err) {
                    console.error("Error while getting affiliates from DB");
                    console.error(err);
                } else {
                    res.send(results);
                    connection.release();
                }
            });
        }
    });
});

app.listen(port);
console.log('Server started! At http://localhost:' + port);

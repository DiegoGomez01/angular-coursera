const express = require('express');
const path = require('path');

const app = express();

app.use(express.static(__dirname + '/dist/finalProject'));
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/dist/finalProject/index.html'));
});

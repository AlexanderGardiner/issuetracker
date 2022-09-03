const express = require("express");
const app = express();
const bodyParser = require('body-parser')
const path = require('path')
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json());
app.use('/static', express.static(path.join(__dirname, 'public')));
app.listen(8000);
console.log("Server Running")
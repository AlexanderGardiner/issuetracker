const express = require("express");
const app = express();
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());
app.use( express.static( __dirname + '/public' ) );
app.listen(80);
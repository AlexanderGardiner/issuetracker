const express = require("express");
const app = express();
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/IssueTracker";
const PORT = 8080;

app.use(bodyParser.urlencoded({ extended: true }))
app.use( express.static( __dirname + '/public' ) );
app.use(bodyParser.json());

app.listen(PORT, function(err){
    if (err) console.log(err);
    console.log("Server listening on PORT", PORT);
});

function createNewProject(projectName) {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("IssueTracker");
        dbo.createCollection(projectName, function(err, res) {
          if (err) throw err;
          console.log("Project Created");
          db.close();
        });
    }); 
}

function createNewIssue(projectName,issueData) {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("IssueTracker");
        dbo.collection(projectName).insertOne(issueData, function(err, res) {
          if (err) throw err;
          console.log("Issue Created");
          db.close();
        });
    }); 
}
createNewProject("Project2");
createNewIssue("Project2",{"test":"test1"})
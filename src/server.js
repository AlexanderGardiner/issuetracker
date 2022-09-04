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

async function createNewProject(projectName) {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        let dbo = db.db("IssueTracker");
        dbo.createCollection(projectName, function(err, res) {
          if (err) throw err;
          console.log("Project Created");
          db.close();
        });
    }); 
}

async function createNewIssue(projectName,issueData) {
    MongoClient.connect(url, async function(err, db) {
        if (err) throw err;
        let dbo = db.db("IssueTracker");
        let id = await dbo.collection(projectName).countDocuments();
        issueData.id = id.toString();
        dbo.collection(projectName).insertOne(issueData, function(err, res) {
          if (err) throw err;
          console.log("Issue Created");
          db.close();
        });
    }); 
}

async function editIssue(projectName,propertyID,propertyName,propertyData) {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        let dbo = db.db("IssueTracker");
        dbo.collection(projectName).updateOne({id:propertyID},{ $set: { [propertyName]: propertyData } }, function(err, res) {
          if (err) throw err;
          console.log("Issue Edited");
          db.close();
        });
    }); 
}
//createNewProject("Project2");
createNewIssue("Project2",{"title":"Is a bug","status":"started"})
editIssue("Project2","1","status","done")
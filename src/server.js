const express = require("express");
const app = express();
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient;
const fs = require('fs');
var url = "mongodb://localhost:27017/IssueTracker";
const PORT = 8080;
var MongoDatabase;
app.use(bodyParser.urlencoded({ extended: true }))
app.use( express.static( __dirname + '/public' ) );
app.use(bodyParser.json());


app.get('/getDefaultSchema',function(req,res){
    let schemaFile = JSON.parse(fs.readFileSync("schema.json", 'utf8'));
    res.send(schemaFile)

});

app.get('/getProjectNames',function(req,res){
    getProjectNames().then((value)=> {
        res.send(value)
    });
    
});

app.post('/createNewProject',function(req,res){
    createNewProject(req.body.projectName);
    setSchema(req.body.projectName,req.body.schema);
    res.send("Recieved")
});

app.listen(PORT, function(err){
    if (err) console.log(err);
    console.log("Server listening on PORT", PORT);
});
async function startupDatabase() {
    console.log("Starting Database");
    MongoDatabase = await MongoClient.connect(url);
}

async function getProjectNames() {
    let collections = await MongoDatabase.db("IssueTracker").listCollections().toArray();
    let collectionNames = [];
    for (let i=0; i<collections.length;i++) {
        collectionNames.push(collections[i].name)
    }
    return collectionNames;
}
async function createNewProject(projectName) {
    console.log("Creating New Project");
    let dbo = MongoDatabase.db("IssueTracker");
    await dbo.createCollection(projectName, function(err, res) {
        if (err) throw err;
        console.log("Project Created");
        
    });
}

async function createNewIssue(projectName,issueData) {
    console.log("Creating New Issue");    
    let dbo = MongoDatabase.db("IssueTracker");
    let id = await dbo.collection(projectName).countDocuments();
    issueData.id = id.toString();
    await dbo.collection(projectName).insertOne(issueData, function(err, res) {
        if (err) throw err;
    });
    
}

async function editIssue(projectName,propertyID,propertyName,propertyData) {
    console.log("Editing Issue");
    let dbo = MongoDatabase.db("IssueTracker");
    await dbo.collection(projectName).updateOne({id:propertyID},{ $set: { [propertyName]: propertyData } }, function(err, res) {
        if (err) throw err;
    });
}

function setSchema(projectName, schema) {
    console.log("Setting Schema")
    if (projectName!="Default") {
        let schemaFile = JSON.parse(fs.readFileSync("schema.json", 'utf8'));
        schemaFile[projectName] = schema;
        console.log(schemaFile);
        fs.writeFileSync("schema.json",JSON.stringify(schemaFile))
    } else {
        console.log("Project name invalid, please choose a different name")
    }
    
    
}

async function main() {
    //setSchema("Default",{"test":"test1"})
    await startupDatabase();
    await getProjectNames();
    //await createNewProject("Project2");
    //await createNewIssue("Project2",{"title":"Is a bug","status":"started"})
    //await editIssue("Project2","2","status","done")
}


main();



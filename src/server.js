// Load required libraries
// Express for routing
// Body-parser for parsing the body
// Mongodb for interfacing with the database

const express = require("express");
const app = express();
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient;
const fs = require('fs');

// Vars for mongodb database
var url = "mongodb://localhost:27017/IssueTracker";
var MongoDatabase;

// Start express server
const PORT = 8080;
app.use(bodyParser.urlencoded({ extended: true }))
app.use( express.static( __dirname + '/public' ) );
app.use(bodyParser.json());

// Get schema from file (need to only send schema for 1 project not all)
app.get('/getDefaultSchema',function(req,res){
    let schemaFile = JSON.parse(fs.readFileSync("schema.json", 'utf8'));
    res.send(schemaFile)

});

// Get list of project names
app.get('/getProjectNames',function(req,res){
    getProjectNames().then((value)=> {
        res.send(value)
    });
    
});

// Create new project in schema and in database
app.post('/createNewProject',function(req,res){
    createNewProject(req.body.projectName);
    setSchema(req.body.projectName,req.body.schema);
    res.send("Recieved")
});

// Get project data from schema and from database
app.post('/getProject',async function(req,res){
    console.log("Getting Project: "+req.body.projectName);
    let schemaFile = JSON.parse(fs.readFileSync("schema.json", 'utf8'))
    let schema = schemaFile[req.body.projectName];
    let project = await getProject(req.body.projectName)
    res.send(JSON.stringify({"project":project,"schema":schema}))
    
});

app.post('/updateProject',async function(req,res){
    console.log(JSON.stringify(req.body.project))
    // TODO: Update project in server
    console.log("Updating Project: "+JSON.stringify(req.body.projectName));

    
});

// Set express server to listen
app.listen(PORT, function(err){
    if (err) console.log(err);
    console.log("Server listening on PORT", PORT);
});

// Connect to database
async function startupDatabase() {
    console.log("Starting Database");
    MongoDatabase = await MongoClient.connect(url);
}

// Get project names from database
async function getProjectNames() {
    let collections = await MongoDatabase.db("IssueTracker").listCollections().toArray();
    let collectionNames = [];
    for (let i=0; i<collections.length;i++) {
        collectionNames.push(collections[i].name)
    }
    return collectionNames;
}

// Get project from database
async function getProject(projectName) {
    let project = await MongoDatabase.db("IssueTracker").collection(projectName).find().toArray();
    return project
}

// Create project in database
async function createNewProject(projectName) {
    console.log("Creating New Project");
    let dbo = MongoDatabase.db("IssueTracker");
    await dbo.createCollection(projectName, function(err, res) {
        if (err) throw err;
        console.log("Project Created");
        
    });
}

// Create new issue in specific project
async function createNewIssue(projectName,issueData) {
    console.log("Creating New Issue");    
    let dbo = MongoDatabase.db("IssueTracker");
    let id = await dbo.collection(projectName).countDocuments();
    issueData.id = id.toString();
    await dbo.collection(projectName).insertOne(issueData, function(err, res) {
        if (err) throw err;
    });
    
}

// Edit issue in specific project
async function editIssue(projectName,propertyID,propertyName,propertyData) {
    console.log("Editing Issue");
    let dbo = MongoDatabase.db("IssueTracker");
    await dbo.collection(projectName).updateOne({id:propertyID},{ $set: { [propertyName]: propertyData } }, function(err, res) {
        if (err) throw err;
    });
}

// Set schema for specific project
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

// Function to run at startup
async function main() {
    //setSchema("Default",{"test":"test1"})
    await startupDatabase();
    await getProjectNames();
    //await createNewProject("Project2");
    //await createNewIssue("Project2",{"title":"Is a bug","status":"started"})
    //await editIssue("Project2","2","status","done")
}


main();



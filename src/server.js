// Load required libraries
// Express for routing
// Body-parser for parsing the body
// Mongodb for interfacing with the database

const express = require("express");
const app = express();
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
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

// Get schema from file (need to only send schema for 1 project not all)
app.get('/getProjectSchema',function(req,res){
    let schemaFile = JSON.parse(fs.readFileSync("schema.json", 'utf8'));
    res.send(schemaFile)

});

app.post('/editProjectSchema',function(req,res){
    res.send("Editing Schema");
    let schema = {};
    let schemaFile = JSON.parse(fs.readFileSync("schema.json", 'utf8'));
    let oldSchema = schemaFile[req.body.projectName]
    let submittedSchema = req.body.schema;
    let submittedSchemaKeys = Object.keys(submittedSchema);
    for (let i=0;i<submittedSchemaKeys.length;i++) {
        
        if (submittedSchema[submittedSchemaKeys[i]].type!="Multiple Choice") {
            schema[submittedSchemaKeys[i]] = submittedSchema[submittedSchemaKeys[i]];
        } else {
            schema[submittedSchemaKeys[i]] = {"type":"Multiple Choice"};
            schema[submittedSchemaKeys[i]].options = oldSchema[submittedSchemaKeys[i]].options;
            for (let j=0;j<submittedSchema[submittedSchemaKeys[i]].newOptions.length;j++) {
                if (submittedSchema[submittedSchemaKeys[i]].newOptions[j]!="") {
                    schema[submittedSchemaKeys[i]].options.push(submittedSchema[submittedSchemaKeys[i]].newOptions[j])
                }
                
            }
        }
    }
    setSchema(req.body.projectName,schema)
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
    res.send("Updating Project")
    console.log("Updating Project: "+JSON.stringify(req.body.projectName));
    project = req.body.project;
    for (let i=0; i<project.length;i++) {
        
        if (project[i].ID=="") {
            // Send to database if new property
            delete project[i].ID;
            createNewIssue(req.body.projectName,project[i])
        } else {
            // Send to database if old property
            let ID = project[i].ID;
            delete project[i].ID;
            let keys = Object.keys(project[i]);
            for (let j=0;j<keys.length;j++) {
                editProperty(req.body.projectName,ID,keys[j],project[i][keys[j]]);
            }
            
        }
    }

    
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

    await dbo.collection(projectName).insertOne(issueData, function(err, res) {
        if (err) throw err;
    });
    
}

// Edit issue in specific project
async function editProperty(projectName,propertyID,propertyName,propertyData) {
    console.log("Editing Property "+propertyName+" from " + propertyID + " from "+projectName);
    let dbo = MongoDatabase.db("IssueTracker");
    await dbo.collection(projectName).updateOne({_id:ObjectId(propertyID.toString())},{ $set: { [propertyName]: propertyData } }, function(err, res) {
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

    await startupDatabase();

}


main();



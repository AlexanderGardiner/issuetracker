const process = require('process')
process.chdir("src")

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
var url = "mongodb+srv://Main:8dmfv2tXNor2HG9T@issuetracker.9w0hzlx.mongodb.net/?retryWrites=true&w=majority";
var MongoDatabase;

async function startExpressServer() {
  // Start express server
  const PORT = 8080;
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use( express.static( __dirname + '/public' ) );
  app.use(bodyParser.json());
  
  // Get default schema
  app.get('/getDefaultSchema',function(req,res){
      let schemaFile = JSON.parse(fs.readFileSync("schema.json", 'utf8'));
      res.send(schemaFile.Default)
  
  });
  
  // Get schema of project
  app.post('/getProjectSchema',function(req,res){
      
      try {
          console.log("Getting "+req.body.projectName+" Schema");
          let schema = {};
          schema[req.body.projectName] = {};
          schema[req.body.projectName]._id = "_id";
          schemaFile = JSON.parse(fs.readFileSync("schema.json", 'utf8'));
          schema[req.body.projectName] = {...schema[req.body.projectName],...schemaFile[req.body.projectName]}
          
          res.send(schema[req.body.projectName])
      } catch (err) {
          console.log(err);
          res.send ({"Error": err});
      }
      
  
  });
  
  // Edit schema of project 
  app.post('/editProjectSchema',function(req,res){
      try {
          let schemaFile = JSON.parse(fs.readFileSync("schema.json", 'utf8'));
          let oldProjectName = req.body.oldProjectName;
          let newProjectName = req.body.newProjectName;
          // Rename project
          if (oldProjectName != newProjectName) {
              MongoDatabase.db("IssueTracker").collection(oldProjectName).rename(newProjectName);
              schemaFile[newProjectName] = schemaFile[oldProjectName];
              delete schemaFile[oldProjectName];
          }
          
          // Edit schema
          console.log("Editing "+newProjectName+" Schema")
          res.send("Editing Schema");
          let schema = {};
          schema["_id"] = {"type":"_id"};
          delete schemaFile[newProjectName]["_id"];
          let oldSchema = schemaFile[newProjectName];
          console.log(oldSchema)

          
          let oldSchemaKeys = Object.keys(oldSchema);
          let submittedSchema = req.body.schema;
          console.log(submittedSchema)
          let submittedSchemaKeys = Object.keys(submittedSchema);
          for (let i=0;i<submittedSchemaKeys.length;i++) {
            if (submittedSchema[submittedSchemaKeys[i]].type!="Multiple Choice") {
              schema[submittedSchemaKeys[i]] = submittedSchema[submittedSchemaKeys[i]];
            } else {
              schema[submittedSchemaKeys[i]] = {"type":"Multiple Choice"};
              if (i<oldSchemaKeys.length) {
                  
                  console.log("SchemaKeys " + oldSchemaKeys[i])
                  console.log("OldSchemaKeys " +oldSchema[oldSchemaKeys[i]].options)
                  schema[submittedSchemaKeys[i]].options = oldSchema[oldSchemaKeys[i]].options;
              } else {
                  schema[submittedSchemaKeys[i]].options = [];
              }
              
              for (let j=0;j<submittedSchema[submittedSchemaKeys[i]].newOptions.length;j++) {
                  if (submittedSchema[submittedSchemaKeys[i]].newOptions[j]!="") {
                      schema[submittedSchemaKeys[i]].options.push(submittedSchema[submittedSchemaKeys[i]].newOptions[j])
                  }
                  
              }
            }
            
              
          }
          
          
          if (schemaFile.hasOwnProperty(newProjectName)) {
              setSchema(newProjectName,schema)
          }
  
          for (let j=0; j<oldSchemaKeys.length;j++) {
            if (j<submittedSchemaKeys.length) {
              if (oldSchemaKeys[j]!=submittedSchemaKeys[j]) {
                  
                  MongoDatabase.db("IssueTracker").collection(newProjectName).updateMany({},{$rename:{[oldSchemaKeys[j]]:submittedSchemaKeys[j]}});
                  
                  
              }
            }
          }

        console.log(req.body.deleteOldProperties)
          if (req.body.deleteOldProperties==true) {
            for (let j=0; j<req.body.schemaIDsToDelete.length;j++) {
              schemaIDToDelete = req.body.schemaIDsToDelete[j];
              console.log(schemaIDToDelete)
              MongoDatabase.db("IssueTracker").collection(newProjectName).updateMany({},{ $unset: {[schemaIDToDelete]:""} }
  )
            }
          }
          
          
      } catch(err) {
          console.log(err);
          res.send ({"Error": err});
      }
  });
  
  // Get list of project names
  app.get('/getProjectNames',function(req,res){
      console.log("Getting Project Names");
      getProjectNames().then((value)=> {
          res.send(value)
      });
      
  });
  
  // Create new project in schema and in database (potential to break if custom request is run)
  app.post('/createNewProject',function(req,res){
      try {
          let updatedTime = (new Date(Date.now())).toString();
          
          console.log("Creating New Project "+req.body.projectName);
          createNewProject(req.body.projectName);
          createNewIssue(req.body.projectName,{"projectTimeEditedExists":"true","projectTimeEdited":updatedTime});
          setSchema(req.body.projectName,req.body.schema);
          res.send("Creating New Project")
      } catch(err) {
          console.log(err);
          res.send ({"Error": err});
      }
      
  });
  
  // Get project data from schema and from database
  app.post('/getProject',async function(req,res){
      try {
          console.log("Getting Project: "+req.body.projectName);
          let schemaFile = JSON.parse(fs.readFileSync("schema.json", 'utf8'));
          let schema = schemaFile[req.body.projectName];
          let project = await getProject(req.body.projectName);
          res.send(JSON.stringify({"project":project,"schema":schema}));
      } catch(err) {
          console.log(err);
          res.send ({"Error": err});
      }
      
      
  });
  
  // Update project issues
  app.post('/updateProject',async function(req,res){
      try {
          
  
          res.send("Updating Project")
  
          let updatedTime = new Date(Date.now());
          editEditedTime(req.body.projectName,updatedTime);
  
          console.log("Updating Project: "+JSON.stringify(req.body.projectName));
          project = req.body.project;
          for (let i=0; i<project.length;i++) {
              
              if (project[i]._id=="Not In Database") {
                  // Send to database if new property
                  delete project[i]._id;
                  createNewIssue(req.body.projectName,project[i])
              } else {
                  // Send to database if old property
                  let ID = project[i]._id;
                  delete project[i]._id;
                  let keys = Object.keys(project[i]);
                  for (let j=0;j<keys.length;j++) {
                      
                      editProperty(req.body.projectName,ID,keys[j],project[i][keys[j]]);
                  }
                  
              }
          }
        // Delete any deleted issues
        deleteIssues(req.body.issueIDsToDelete,req.body.projectName);
      } catch(err) {
          console.log(err);
          res.send ({"Error": err});
      }
      
  
      
  });
  
  app.post('/deleteProject',async function(req,res){
      try {
          await deleteProject(req.body.projectName);
          res.send("Deleted");
          
      } catch(err) {
          console.log(err);
          res.send ({"Error": err});
      }
      
  
      
  });

  // Set express server to listen
  app.listen(PORT, function(err){
      if (err) console.log(err);
      console.log("Server listening on PORT", PORT);
  });
}



// Connect to database
async function startupDatabase() {
  try {
    console.log("Starting Database");
    MongoDatabase = await MongoClient.connect(url);
    console.log("Database Started")
  } catch(err) {
    console.log(err);
  }
    
  
}


// Delete arr of issues
async function deleteIssues(issueIDs,projectName) {
  try {
    for (let i=0; i<issueIDs.length;i++) {
      await MongoDatabase.db("IssueTracker").collection(projectName).deleteOne({_id:ObjectId(issueIDs[i])});
    }
  } catch(err) {
    console.log(err);
  }
    
  
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
    console.log("Editing Property "+propertyName+" from " + propertyID + " from "+projectName+" and setting to "+propertyData);
  
    let dbo = MongoDatabase.db("IssueTracker");
    await dbo.collection(projectName).updateOne({_id:ObjectId(propertyID.toString())},{ $set: { [propertyName]: propertyData } }, function(err, res) {
        if (err) throw err;
    });
}

// Edit time project was last edited
async function editEditedTime(projectName,time) {
    console.log("Editing Edited Time from Project "+projectName);
    let dbo = MongoDatabase.db("IssueTracker");
    await dbo.collection(projectName).updateOne({projectTimeEditedExists:"true"},{ $set: { projectTimeEdited: time.toUTCString() } }, function(err, res) {
        if (err) throw err;
    });
}

async function deleteProject(projectName) {

    let schemaFile = JSON.parse(fs.readFileSync("schema.json", 'utf8'));
    await MongoDatabase.db("IssueTracker").collection(projectName).drop();
    
    delete schemaFile[projectName];
    fs.writeFileSync("schema.json",JSON.stringify(schemaFile));

    

}


// Set schema for specific project
function setSchema(projectName, schema) {
    console.log("Setting Schema")
    if (projectName!="Default") {
        let schemaFile = JSON.parse(fs.readFileSync("schema.json", 'utf8'));
        schemaFile[projectName] = schema;
        console.log(schemaFile);
        fs.writeFileSync("schema.json",JSON.stringify(schemaFile));
    } else {
        console.log("Project name invalid, please choose a different name")
    }
    
    
}

// Function to run at startup
async function main() {

    await startupDatabase();
  
    await startExpressServer();

}


main();



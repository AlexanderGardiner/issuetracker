// Load required libraries
// Process for changing working directory
// Express for routing
// Body-parser for parsing the body
// Mongodb for interfacing with the database
const process = require('process');
const express = require("express");
const session = require('express-session');
const app = express();
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const fs = require('fs');
const fileupload = require("express-fileupload");

const passport = require('passport');
const LocalStrategy = require('passport-local');
const crypto = require('crypto');

const MongoStore = require('connect-mongo');

// Change working directory 
//process.chdir("src");;

// Vars for mongodb database
//var url = "mongodb+srv://Main:yF5HIDis6Dmwq2fn@issuetracker.9w0hzlx.mongodb.net/?retryWrites=true&w=majority";
var url = "mongodb+srv://Main:Y7yVJWKwHmmhZ40a@issuetracker.9w0hzlx.mongodb.net/?retryWrites=true&w=majority";
//var url = "mongodb+srv://Sus:OBPuh2Y808ieLUzX@cluster0.czvwi.mongodb.net/?retryWrites=true&w=majority"
//var url = "mongodb://localhost:27017";
var MongoDatabase;


// Start express server
async function startExpressServer() {
  console.log("Starting Express Server");
  // Define port and set up static files and body parser
  const PORT = 8080;
  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(fileupload());
  app.use(bodyParser.json());



  app.use(session({
    secret: '7861',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: url })
  }));
  app.use(passport.initialize());
  app.use(passport.session());


  // Setup passport
  passport.use(new LocalStrategy(async function verify(username, password, cb) {

    let row = await MongoDatabase.db("Authentication").collection("Credentials").findOne({ username: username });
    if (!row) { return cb(null, false, { message: 'Incorrect username or password.' }); }


    crypto.pbkdf2(password, Buffer.from(row.salt.toString()), 310000, 32, 'sha256', async function(err, hashedPassword) {
      if (err) { return cb(err); }

      if (Buffer.from(row.hashedPassword).byteLength != Buffer.from(hashedPassword.toString()).byteLength) {
        return cb(null, false, { message: 'Incorrect username or password.' });
      }

      if (!crypto.timingSafeEqual(Buffer.from(row.hashedPassword), Buffer.from(hashedPassword.toString()))) {
        return cb(null, false, { message: 'Incorrect username or password.' });
      }
      return cb(null, row);
    });
  }));

  passport.serializeUser(function(user, cb) {
    process.nextTick(function() {
      cb(null, { id: user.id, username: user.username });
    });
  });

  passport.deserializeUser(function(user, cb) {
    process.nextTick(function() {
      return cb(null, user);
    });
  });

  app.use((req, res, next) => {
    if (req.user) {
      next();
    } else {
      if (req.path != "/login/login.html" && req.path != "/login/password") {
        res.redirect("/login/login.html");
      } else {
        next();
      }

    }

  });

  app.use(express.static(__dirname + '/public'));

  app.post('/login/password', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login/login.html'
  }));

  app.get('/logout', function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
  });

  app.get('/checkLoggedIn', async function(req, res) {
    if (req.user) {
      res.send({"Username":req.user.username});
    } else {
      res.sendStatus(401);
    }
  });

  app.get('/adminPanel.html', async function(req, res) {
    if (req.user) {
      try {
        let usernameType = await (MongoDatabase.db("Authentication").collection("Credentials").findOne({ username: req.user.username }, { projection: { userType: 1 } }));
        if (usernameType.userType == "Admin") {
          res.sendFile(__dirname + "/private/adminPanel/adminPanel.html");
        } else {
          res.redirect("/login/login.html");
        }



      } catch (err) {
        console.log(err);
      }
    } else {
      res.redirect("/login/login.html");
    }
  });

  app.get('/adminPanel.js', async function(req, res) {
    if (req.user) {
      try {
        let usernameType = await (MongoDatabase.db("Authentication").collection("Credentials").findOne({ username: req.user.username }, { projection: { userType: 1 } }));
        if (usernameType.userType == "Admin") {
          res.sendFile(__dirname + "/private/adminPanel/adminPanel.js");
        } else {
          res.redirect("/login/login.html");
        }



      } catch (err) {
        console.log(err);
      }
    } else {
      res.redirect("/login/login.html");
    }
  });


  

  // Get default schema
  app.get('/getDefaultSchema', function(req, res) {
    if (req.user) {
      try {
        let schemaFile = JSON.parse(fs.readFileSync("schema.json", 'utf8'));
        res.send(schemaFile.Default);
      } catch (err) {
        console.log(err);
      }
    } else {
      respondWithLoginPage(res);
    }
  });

  // Get users
  app.post('/getUsers', async function(req, res) {
    if (req.user) {
      try {
        let usernameType = await (MongoDatabase.db("Authentication").collection("Credentials").findOne({ username: req.user.username }, { projection: { userType: 1 } }));
        if (usernameType.userType == "Admin") {
          let query = {};
          if (req.body.hasOwnProperty("filters")) {
            
            let filters = req.body.filters;
            let filterKeys = Object.keys(filters);
           
            for (let i=0; i<filterKeys.length; i++) {
              if (filterKeys[i] == "Username") {
                query.username = filters["Username"];
              } 
  
              if (filterKeys[i] == "User Type") {
                query.userType = filters["User Type"];
              }
            }

          }
          
      
          let options = {
            sort: {username : 1 },
            projection: {username: 1, userType: 1 },
          };
      
          let users = await MongoDatabase.db("Authentication").collection("Credentials").find(query, options).toArray();
          res.send({"Users":users});
        }
      } catch (err) {
        console.log(err);
      }
    } else {
      respondWithLoginPage(res);
    }
  });


  // Update users
  app.post('/updateUsers', async function(req, res) {
    if (req.user) {
      try {
        let usernameType = await (MongoDatabase.db("Authentication").collection("Credentials").findOne({ username: req.user.username }, { projection: { userType: 1 } }));
        if (usernameType.userType == "Admin") {
          let users = req.body.users;
          for (let i = 0; i < users.length; i++) {  
            let countDuplicateUsers = await MongoDatabase.db("Authentication").collection("Credentials").countDocuments({username:users[i].username});
            console.log(countDuplicateUsers);
            if (countDuplicateUsers==0) {
              if (users[i].password) {
                let salt = JSON.stringify(crypto.randomBytes(16).toJSON().data);
                crypto.pbkdf2(users[i].password, Buffer.from(salt.toString()), 310000, 32, 'sha256', async function(err, hashedPassword) {
                await MongoDatabase.db("Authentication").collection("Credentials").updateOne({username: users[i].oldUsername}
                  , {
                      $set: {
                        "username": users[i].username,
                        "hashedPassword": hashedPassword.toString(),
                        "password": users[i].password,
                        "userType": users[i].userType,
                        "salt": salt
                      }
                    }, function(err, res) {
                      if (err) throw err;
                    });
  
                    req.logout(function(err) {
                      if (err) { return next(err); }
                      res.redirect('/');
                    });
                });
              } else {
                await MongoDatabase.db("Authentication").collection("Credentials").updateOne({username: users[i].oldUsername}
                , {
                    $set: {
                      username: users[i].username,
                      userType: users[i].userType
                    }
                  }, function(err, res) {
                    if (err) throw err;
                  });
              }
              
            } else {
              res.send("A user already exists with that username!"); 
            }

            
          }
        }
      } catch (err) {
        console.log(err);
      }
    } else {
      respondWithLoginPage(res);
    }
  });

  // Get schema of project
  app.post('/getProjectSchema', function(req, res) {
    try {
      if (req.user) {
        let projectName = String(req.body.projectName);
        let schema = {};
        schema[projectName] = {};

        // Set ID element in schema
        schema[projectName]._id = "_id";

        // Set project schema
        schemaFile = JSON.parse(fs.readFileSync("schema.json", 'utf8'));
        schema[projectName] = {
          ...schema[projectName],
          ...schemaFile[projectName]
        };

        res.send(schema[projectName]);
      } else {
        respondWithLoginPage(res);
      }
    } catch (err) {
      console.log(err);
      res.send({
        "Error": err
      });
    }

  });

  // Edit schema of project 
  app.post('/editProjectSchema', async function(req, res) {
    try {
      if (req.user) {
        // Define vars
        let schemaFile = JSON.parse(fs.readFileSync("schema.json", 'utf8'));
        let oldProjectName = String(req.body.oldProjectName);
        let newProjectName = String(req.body.newProjectName);

        // Rename project if necessary
        if (oldProjectName != newProjectName) {
          await MongoDatabase.db("IssueTracker").collection(oldProjectName).rename(newProjectName);
          schemaFile[newProjectName] = schemaFile[oldProjectName];
          delete schemaFile[oldProjectName];
          fs.rename(('./files/' + oldProjectName), ('./files/' + newProjectName));
        }

        // Setup vars and define ID element
        let schema = {};
        schema["_id"] = {
          "type": "_id"
        };

        // Delete unused id element
        delete schemaFile[newProjectName]["_id"];

        // Declare schema vars
        let oldSchema = schemaFile[newProjectName];
        let oldSchemaKeys = Object.keys(oldSchema);
        let submittedSchema = req.body.schema;
        let submittedSchemaKeys = Object.keys(submittedSchema);

        // Loop through schema and process based on type
        for (let i = 0; i < submittedSchemaKeys.length; i++) {
          if (submittedSchema[submittedSchemaKeys[i]].type != "Multiple Choice") {
            schema[submittedSchemaKeys[i]] = submittedSchema[submittedSchemaKeys[i]];
          } else {
            schema[submittedSchemaKeys[i]] = {
              "type": "Multiple Choice"
            };

            if (i < oldSchemaKeys.length && !req.body.schemaIDsToDelete.includes(oldSchemaKeys[i])) {
              schema[submittedSchemaKeys[i]].options = oldSchema[oldSchemaKeys[i]].options;
            } else {
              schema[submittedSchemaKeys[i]].options = [];
            }

            for (let j = 0; j < submittedSchema[submittedSchemaKeys[i]].newOptions.length; j++) {
              if (submittedSchema[submittedSchemaKeys[i]].newOptions[j] != "") {
                schema[submittedSchemaKeys[i]].options.push(submittedSchema[submittedSchemaKeys[i]].newOptions[j]);
              }
            }
          }
        }

        // Delete properties in database if required
        if (req.body.deleteOldProperties == true) {
          for (let j = 0; j < req.body.schemaIDsToDelete.length; j++) {
            schemaIDToDelete = req.body.schemaIDsToDelete[j];
            if (schemaFile[newProjectName][req.body.schemaIDsToDelete[j]].type == "File") {
              let filesToDelete = await MongoDatabase.db("IssueTracker").collection(newProjectName).find({}, { "projection": { [req.body.schemaIDsToDelete[j]]: 1, "_id": 0 } }).toArray();
              for (let k = 1; k < filesToDelete.length; k++) {
                if (filesToDelete[k][req.body.schemaIDsToDelete[j]].fileID != undefined) {
                  fs.unlinkSync("./files/" + newProjectName + "/" + filesToDelete[k][req.body.schemaIDsToDelete[j]].fileID);
                }

              }

            }
            await MongoDatabase.db("IssueTracker").collection(newProjectName).updateMany({}, {
              $unset: {
                [schemaIDToDelete]: ""
              }
            });
          }
        }

        // Set schema if it exists
        if (schemaFile.hasOwnProperty(newProjectName)) {
          updateSchema(newProjectName, oldProjectName, schema);
        }

        // Rename properties in database if required
        for (let j = 0; j < oldSchemaKeys.length; j++) {
          if (j < submittedSchemaKeys.length) {
            if (oldSchemaKeys[j] != submittedSchemaKeys[j]) {
              await MongoDatabase.db("IssueTracker").collection(newProjectName).updateMany({}, {
                $rename: {
                  [oldSchemaKeys[j]]: submittedSchemaKeys[j]
                }
              });
            }
          }
        }


        res.send("Schema Edited");
      } else {
        respondWithLoginPage(res);
      }
    } catch (err) {
      console.log(err);
      res.send({
        "Error": err
      });
    }

  });

  // Get list of project names
  app.get('/getProjectNames', function(req, res) {
    if (req.user) {
      getProjectNames().then((value) => {
        res.send(value);
      });
    } else {
      respondWithLoginPage(res);
    }

  });

  // Create new project in schema and in database 
  app.post('/createNewProject', function(req, res) {
    try {
      if (req.user) {
        // Set updated time and set in database
        let updatedTime = (new Date(Date.now())).toString();
        createNewProject(req.body.projectName);
        createNewIssue(req.body.projectName, {
          "projectTimeEditedExists": "true",
          "projectTimeEdited": updatedTime,
          "filesUploaded": 0
        });

        // Create schema
        setSchema(req.body.projectName, req.body.schema);
        res.send("Creating New Project");
      } else {
        respondWithLoginPage(res);
      }
    } catch (err) {
      console.log(err);
      res.send({
        "Error": err
      });
    }

  });

  // Get project data from schema and from database
  app.post('/getProject', async function(req, res) {
    try {
      console.time("updateProject");
      if (req.user) {
        let schemaFile = JSON.parse(fs.readFileSync("schema.json", 'utf8'));
        let schema = schemaFile[req.body.projectName];
        let project;
        if (req.body.hasOwnProperty('filters')) {
          let filters = req.body.filters;
          let filtersKeys = Object.keys(filters);
          let filter = { projectTimeEditedExists: { $exists: false } };
          for (let i = 0; i < filtersKeys.length; i++) {
            if (schema[filtersKeys[i]].type == "_id") {
              filter[filtersKeys[i]] = { $eq: ObjectId(filters[filtersKeys[i]].toString()) };
            } else if (schema[filtersKeys[i]].type == "Text" || schema[filtersKeys[i]].type == "ReadOnlyText") {
              filter[filtersKeys[i]] = { $eq: filters[filtersKeys[i]] };
            } else if (schema[filtersKeys[i]].type == "Time") {
              if (!(filters[filtersKeys[i]].startTime == null) && !(filters[filtersKeys[i]].endTime == null)) {
                filter[filtersKeys[i]] = { $gte: new Date(filters[filtersKeys[i]].startTime), $lt: new Date(filters[filtersKeys[i]].endTime) };
              } else if (!(filters[filtersKeys[i]].startTime == null)) {
                filter[filtersKeys[i]] = { $gte: new Date(filters[filtersKeys[i]].startTime) };
              } else if (!(filters[filtersKeys[i]].endTime == null)) {
                filter[filtersKeys[i]] = { $lt: new Date(filters[filtersKeys[i]].endTime) };
              }

            } else if (schema[filtersKeys[i]].type == "Multiple Choice" || schema[filtersKeys[i]].type == "Multiple Choice ReadOnly") {
              filter[filtersKeys[i]] = { $eq: filters[filtersKeys[i]] };
            } else if (schema[filtersKeys[i]].type == "User") {
              filter[filtersKeys[i]] = { $eq: filters[filtersKeys[i]] };
            } else if (schema[filtersKeys[i]].type == "File") {
              filter[filtersKeys[i] + ".fileName"] = { $eq: filters[filtersKeys[i]] };
            }
          }
          project = await getProject(req.body.projectName, filter);
        } else {
          project = await getProject(req.body.projectName, { projectTimeEditedExists: { $exists: false } });
        }

        console.timeEnd("updateProject");
        res.send(JSON.stringify({
          "project": project,
          "schema": schema,
        }));
      } else {
        respondWithLoginPage(res);

      }
    } catch (err) {
      console.log(err);
      res.send({
        "Error": err
      });
    }




  });


  // Get project data from schema and from database
  app.post('/getProjectFile', async function(req, res) {
    try {
      if (req.user) {
        let issueID = req.body.issueID;
        let propertyName = req.body.propertyName;
        let fileID = (await MongoDatabase.db("IssueTracker").collection(req.body.projectName).findOne({ _id: ObjectId(issueID) }))[propertyName].fileID;
        res.sendFile(__dirname + "/files/" + req.body.projectName + "/" + fileID);
      } else {
        respondWithLoginPage(res);
      }
    } catch (err) {
      console.log(err);
      res.send({
        "Error": err
      });
    }


  });



  // Update project issues
  app.post('/updateProject', async function(req, res) {
    try {
      if (req.user) {
        // Vars
        let projectName = req.body.projectName;
        let path = './files/' + projectName + "/";
        let tempFilesUploaded = 0;

        let updatedTime = new Date(Date.now());
        await editEditedTime(projectName, updatedTime);

        // Delete files that need deleting
        for (let i = 0; i < req.body.projectFileIDsToDelete.length; i++) {
          let fileID = req.body.projectFileIDsToDelete[i];
          fs.unlinkSync(path + fileID, (err => {
            if (err) console.log(err)
          }));
        }



        project = req.body.project;

        for (let i = 0; i < project.length; i++) {
          if (project[i]._id == "Not In Database") {
            // Send to database if new property
            delete project[i]._id;

            let filesUploaded = (await MongoDatabase.db("IssueTracker").collection(projectName).findOne({})).filesUploaded;
            let keys = Object.keys(project[i]);
            for (let j = 0; j < keys.length; j++) {
              if (req.body.schema[req.body.schemaKeys[j + 1]].type == "File") {
                if (project[i][req.body.schemaKeys[j + 1]] != "") {
                  let fileID = filesUploaded + project[i][keys[j]].substring(project[i][keys[j]].lastIndexOf("."), project[i][keys[j]].length);
                  project[i][req.body.schemaKeys[j + 1]] = { "fileName": project[i][req.body.schemaKeys[j + 1]], "fileID": fileID };
                  await MongoDatabase.db("IssueTracker").collection(projectName).updateOne({}
                    , {
                      $set: {
                        "filesUploaded": filesUploaded + 1
                      }
                    }, function(err, res) {
                      if (err) throw err;
                    });

                  fs.renameSync("./files/" + projectName + "/" + project[i][req.body.schemaKeys[j + 1]].fileName + (tempFilesUploaded.toString()), "./files/" + projectName + "/" + fileID);

                  filesUploaded += 1;
                  tempFilesUploaded += 1;
                }
              } else if (req.body.schema[req.body.schemaKeys[j + 1]].type == "Time") {
                project[i][keys[j + 1]] = new Date(project[i][keys[j]]);
              }
            }


            await createNewIssue(projectName, project[i]);

          } else {

            // Send to database if existing property
            let ID = project[i]._id;
            delete project[i]._id;
            let keys = Object.keys(project[i]);
            for (let j = 0; j < keys.length; j++) {
              if (req.body.schema[req.body.schemaKeys[j + 1]].type == "File") {
                if (project[i][req.body.schemaKeys[j + 1]] != "") {
                  let filesUploaded = (await MongoDatabase.db("IssueTracker").collection(projectName).findOne({})).filesUploaded;
                  let fileID = filesUploaded + project[i][req.body.schemaKeys[j + 1]].substring(project[i][keys[j]].lastIndexOf("."), project[i][keys[j]].length);
                  await editIssue(projectName, ID, keys[j], { "fileName": project[i][keys[j]], "fileID": fileID });
                  await MongoDatabase.db("IssueTracker").collection(projectName).updateOne({}
                    , {
                      $set: {
                        "filesUploaded": filesUploaded + 1
                      }
                    }, function(err, res) {
                      if (err) throw err;
                    });


                  fs.renameSync("./files/" + projectName + "/" + project[i][req.body.schemaKeys[j + 1]] + (tempFilesUploaded.toString()), "./files/" + projectName + "/" + fileID);
                  filesUploaded += 1;
                  tempFilesUploaded += 1;
                }

              } else if (req.body.schema[req.body.schemaKeys[j + 1]].type == "Time") {
                await editIssue(projectName, ID, keys[j], new Date(project[i][keys[j]]));
              } else {
                await editIssue(projectName, ID, keys[j], project[i][keys[j]]);
              }


            }

          }
        }
        // Delete any deleted issues
        await deleteIssues(req.body.issueIDsToDelete, projectName);

        res.send("Success");
      } else {
        respondWithLoginPage(res);
      }
    } catch (err) {
      console.log(err);

    }



  });

  // Update project files
  app.post('/updateProjectFiles', async function(req, res) {
    try {
      if (req.user) {
        // Vars
        let files = req.files;
        let fileKeys = Object.keys(files);
        let projectName = req.query.projectName;
        let path = './files/' + projectName + "/";

        // Create folder if it doesn't exists/
        if (!fs.existsSync("./files/" + projectName)) {
          fs.mkdirSync("./files/" + projectName);

        }
        // Get file and put into folder
        for (let i = 0; i < fileKeys.length; i++) {
          let fileName = files[fileKeys[i]].name;
          files[fileKeys[i]].mv(path + fileName);

        }


        res.send("Success");
      } else {
        respondWithLoginPage(res);
      }
    } catch (err) {
      console.log(err);
      res.send({
        "Error": err
      });
    }

  });

  // Delete project files
  app.post('/deleteProjectFiles', async function(req, res) {
    try {
      if (req.user) {
        let files = req.files;
        let fileKeys = Object.keys(files);
        let projectName = req.query.projectName;
        let path = './files/' + projectName + "/"

        for (let i = 0; i < fileKeys.length; i++) {
          fs.unlinkSync(path + files[fileKeys[i]].name, (err => {
            if (err) console.log(err)
          }));
        }
      } else {
        respondWithLoginPage(res);
      }

    } catch (err) {
      console.log(err);
      res.send({
        "Error": err
      });
    }

  });


  // Delete project
  app.post('/deleteProject', async function(req, res) {
    try {
      if (req.user) {
        await deleteProject(req.body.projectName);
        res.send("Deleted");
      } else {
        respondWithLoginPage(res);
      }
    } catch (err) {
      console.log(err);
      res.send({
        "Error": err
      });
    }
  });




  // Set express server to listen
  app.listen(PORT, function(err) {
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
  } catch (err) {
    console.log(err);
  }
}


// Delete arr of issues
async function deleteIssues(issueIDs, projectName) {
  try {
    for (let i = 0; i < issueIDs.length; i++) {
      await MongoDatabase.db("IssueTracker").collection(projectName).deleteOne({
        _id: ObjectId(issueIDs[i])
      });
    }
  } catch (err) {
    console.log(err);
  }
}

// Get project names from database
async function getProjectNames() {
  let collections = await MongoDatabase.db("IssueTracker").listCollections().toArray();
  let collectionNames = [];
  for (let i = 0; i < collections.length; i++) {
    collectionNames.push(collections[i].name)
  }
  return collectionNames;
}

// Get project from database
async function getProject(projectName, filters) {
  let project = await MongoDatabase.db("IssueTracker").collection(projectName).find(filters).limit(20).toArray();
  let projectHeader = await MongoDatabase.db("IssueTracker").collection(projectName).findOne({ projectTimeEditedExists: { $exists: true } });
  project.unshift(projectHeader);

  return project
}


// Create project in database
async function createNewProject(projectName) {
  let dbo = MongoDatabase.db("IssueTracker");
  fs.mkdirSync("./files/" + projectName);
  await dbo.createCollection(projectName, function(err, res) {
    if (err) throw err;
  });
}

// Create new issue in specific project
async function createNewIssue(projectName, issueData) {
  let dbo = MongoDatabase.db("IssueTracker");

  await dbo.collection(projectName).insertOne(issueData, function(err, res) {
    if (err) throw err;
  });

}

// Edit issue in a project
async function editIssue(projectName, issueID, propertyName, propertyData) {
  if (propertyData == null) {
    propertyData = "";
  }
  let dbo = MongoDatabase.db("IssueTracker");
  await dbo.collection(projectName).updateOne({
    _id: ObjectId(issueID.toString())
  }, {
    $set: {
      [propertyName]: propertyData
    }
  }, function(err, res) {
    if (err) throw err;
  });
}

// Set time project was last edited
async function editEditedTime(projectName, time) {
  let dbo = MongoDatabase.db("IssueTracker");
  await dbo.collection(projectName).updateOne({
    projectTimeEditedExists: "true"
  }, {
    $set: {
      projectTimeEdited: time
    }
  }, function(err, res) {
    if (err) throw err;
  });
}

// Delete project
async function deleteProject(projectName) {
  let schemaFile = JSON.parse(fs.readFileSync("schema.json", 'utf8'));
  await MongoDatabase.db("IssueTracker").collection(projectName).drop();
  let directory = "./files/" + projectName + "/";

  for (fileToDelete of fs.readdirSync(directory)) {
    fs.unlinkSync(directory + fileToDelete);
  }
  fs.rmdirSync("./files/" + projectName);
  delete schemaFile[projectName];
  fs.writeFileSync("schema.json", JSON.stringify(schemaFile));

}


// Set schema for specific project
function setSchema(projectName, schema) {
  if (projectName != "Default") {
    let schemaFile = JSON.parse(fs.readFileSync("schema.json", 'utf8'));
    schemaFile[projectName] = schema;
    fs.writeFileSync("schema.json", JSON.stringify(schemaFile));
  } else {
    console.log("Project name invalid, please choose a different name")
  }


}

// Set schema for specific project
function updateSchema(projectName, oldProjectName, schema) {
  if (projectName != "Default") {
    let schemaFile = JSON.parse(fs.readFileSync("schema.json", 'utf8'));
    schemaFile[projectName] = schema;
    if (oldProjectName != projectName) {
      delete schemaFile[oldProjectName];
    }

    fs.writeFileSync("schema.json", JSON.stringify(schemaFile));
  } else {
    console.log("Project name invalid, please choose a different name")
  }


}

function respondWithLoginPage(res) {

  res.send({ redirect: "/login" });
}

// Function to run at startup
async function main() {
  // Start database
  await startupDatabase();

  // Start server
  await startExpressServer();

}

// Start program
main();
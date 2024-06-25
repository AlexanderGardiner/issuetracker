// Define global vars
let projectName;
let schemaTable;
let tableSchema;

// Get the default schema and send it to be displayed
fetch("/issuetracker/getDefaultSchema", {
  method: "GET",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "access-control-allow-origin": "*",
  },
})
  .then((response) => response.json())
  .then((data) => displaySchema(data));

fetch("/issuetracker/checkLoggedIn", {
  method: "GET",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "access-control-allow-origin": "*",
  },
})
  .then((response) => response.json())
  .then(
    (username) =>
      (document.getElementById("username").innerHTML = username.Username)
  );

// Display schema in editable table using inputs
function displaySchema(schema) {
  if (schema.hasOwnProperty("redirect")) {
    window.location.href = "/issuetracker/login/login.html";
  }
  console.log("Displaing schema");
  // Define table for selecting schema
  projectSchema = schema;
  schemaKeys = Object.keys(projectSchema);
  tableSchema = {
    "Name of Property": {
      type: "Text",
    },
    "Type of Property": {
      type: "Multiple Choice",
      options: ["Text", "Time", "Multiple Choice", "User", "File"],
    },
    Choices: {
      type: "Text",
    },
  };

  // Define vars for table and schema names
  tableSchemaKeys = Object.keys(tableSchema);
  let tableData = [];

  for (let i = 0; i < schemaKeys.length; i++) {
    tableData.push({});

    // Populate first column
    tableData[i][tableSchemaKeys[0]] = schemaKeys[i];

    // Populate second column
    tableData[i][tableSchemaKeys[1]] = projectSchema[schemaKeys[i]].type;

    // Populate third column
    if (projectSchema[schemaKeys[i]].type == "Multiple Choice") {
      tableData[i][tableSchemaKeys[2]] = projectSchema[schemaKeys[i]].options;
    } else {
      tableData[i][tableSchemaKeys[2]] = "";
    }

    // Populate fourth column
    tableData[i][tableSchemaKeys[3]] = "";
  }

  // Create table
  schemaTable = new table(tableData, tableSchema, true);
}

// Add property to schema
function addProperty() {
  console.log("Adding property");
  // Define table for selecting schema of new row
  newRowTableSchema = {
    "Name of Property": {
      type: "Text",
    },
    "Type of Property": {
      type: "Multiple Choice",
      options: ["Text", "Time", "Multiple Choice", "User", "File"],
    },
    Choices: {
      type: "Text",
    },
  };

  newRowTableSchemaKeys = Object.keys(newRowTableSchema);
  blankTableSchema = {};
  for (let i = 0; i < tableSchemaKeys.length; i++) {
    blankTableSchema[tableSchemaKeys[i]] = "";
  }

  // Add row to the table
  schemaTable.addRow(blankTableSchema, newRowTableSchema);
}

// Remove last property from table
function removeProperty() {
  console.log("Reomving property");
  schemaTable.removeRow(undefined);
}

function checkProjectNamesAndUploadProject() {
  // Get project names
  fetch("/issuetracker/getProjectNames", {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "access-control-allow-origin": "*",
    },
  })
    .then((response) => response.json())
    .then((data) => createProject(data));
}

// Submit project to server to be created
function createProject(projectNames) {
  console.log("Creating project");
  let schemaData = schemaTable.exportTable(tableSchema);
  projectName = document.getElementById("projectName").value;
  if (!projectNames.includes(projectName)) {
    let updatedSchema = {};
    updatedSchema._id = { type: "_id" };

    // Format multiple choice schema
    for (let i = 0; i < schemaData.length; i++) {
      if (schemaData[i]["Type of Property"] == "Multiple Choice") {
        updatedSchema[schemaData[i]["Name of Property"]] = {
          type: schemaData[i]["Type of Property"],
          options: schemaData[i]["Choices"].split(","),
        };
      } else {
        updatedSchema[schemaData[i]["Name of Property"]] = {
          type: schemaData[i]["Type of Property"],
        };
      }
    }

    // Send new project to server
    fetch("/issuetracker/createNewProject", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "access-control-allow-origin": "*",
      },
      body: JSON.stringify({
        projectName: projectName,
        schema: updatedSchema,
      }),
    })
      .then((response) => response.text())
      .then((data) => redirectToProject(data));
  } else {
    alert("Project already exists");
  }
}

// Open project page
function redirectToProject(data) {
  console.log("Redirecting to project page");
  window.location.href = "../project/project.html?projectName=" + projectName;
}

// Cancel creating project
function cancel() {
  console.log("Canceling project creation");
  window.location.href = "../";
}

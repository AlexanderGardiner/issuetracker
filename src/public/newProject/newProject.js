let projectName;


// Get the default schema and send it to be displayed
fetch("/getDefaultSchema", {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'access-control-allow-origin': '*'
        }
    })
    .then(response => response.json())
    .then(data => displaySchema(data));

let schemaTable;
let tableSchema;

// Display schema in editable table using inputs
function displaySchema(schema) {

  projectSchema = schema;
  schemaKeys = Object.keys(projectSchema);
  tableSchema = {
    "Name of Property": {
      "type": "Text"
    },
    "Type of Property": {
      "type": "Multiple Choice",
      "options": ["Text", "Time", "Multiple Choice", "User","File"]
    },
    "Choices": {
      "type": "Text"
    }
  };
  tableSchemaKeys = Object.keys(tableSchema)
  let tableData = [];

  for (let i = 0; i < schemaKeys.length; i++) {
    tableData.push({});

    tableData[i][tableSchemaKeys[0]] = schemaKeys[i];



    tableData[i][tableSchemaKeys[1]] = projectSchema[schemaKeys[i]].type;


    if (projectSchema[schemaKeys[i]].type == "Multiple Choice") {
      tableData[i][tableSchemaKeys[2]] = projectSchema[schemaKeys[i]].options;
    } else {
      tableData[i][tableSchemaKeys[2]] = "";
    }



    tableData[i][tableSchemaKeys[3]] = "";
  }

  schemaTable = new table(tableData, tableSchema)
}

// Add property to table
function addProperty() {
  newRowTableSchema = {
    "Name of Property": {
      "type": "Text"
    },
    "Type of Property": {
      "type": "Multiple Choice",
      "options": ["Text", "Time", "Multiple Choice", "User","File"]
    },
    "Choices": {
      "type": "Text"
    }
  };
  blankTableSchema = {};
  for (let i = 0; i < tableSchemaKeys.length; i++) {
    blankTableSchema[tableSchemaKeys[i]] = "";
  }

  schemaTable.addRow(blankTableSchema, newRowTableSchema)

 
}

// Remove last property from table
function removeProperty() {
  schemaTable.removeRow();
}

// Submit project to server to be created
function createProject() {
  let schemaData = schemaTable.exportTable(tableSchema);
  projectName = document.getElementById("titleInput").value;
  let updatedSchema = {};
  updatedSchema._id = {"type":"_id"};
  // Format multiple choice schema
  for (let i = 0; i < schemaData.length; i++) {
    if (schemaData[i]["Type of Property"] == "Multiple Choice") {
      updatedSchema[schemaData[i]["Name of Property"]] = {
        "type": schemaData[i]["Type of Property"],
        "options": schemaData[i]["Choices"].split(',')
      };
      
    } else {
      updatedSchema[schemaData[i]["Name of Property"]] = {
        "type": schemaData[i]["Type of Property"]
      };
    }

  }

  // Send new project to server
  fetch("/createNewProject", {
    method: 'POST',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'access-control-allow-origin': '*'
    },
    body: JSON.stringify({
        "projectName": projectName,
        "schema": updatedSchema
    })
  })
  .then(response => response.text())
  .then(data => redirectToProject(data));

}

function redirectToProject(data) {

    window.location.href = "../project/project.html?projectName=" + projectName;

}

function cancel() {
    window.location.href = "../";
}
// Get project to open from url
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const projectName = urlParams.get("projectName");
document.getElementById("projectName").setAttribute("value", projectName);

// Get the default schema and send it to be displayed
fetch("/issuetracker/getProjectSchema", {
  method: "POST",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "access-control-allow-origin": "*",
  },
  body: JSON.stringify({
    projectName: projectName,
  }),
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

// Get table
let schemaTable;
let projectSchema;
let schemaKeys;
let tableSchema;
let tableSchemaKeys;
let schemaIDsToDelete = [];

// Display schema in editable table using inputs
function displaySchema(schema) {
  if (schema.hasOwnProperty("redirect")) {
    window.location.href = "/login/login.html";
  }
  console.log("Displaying schema");
  // Define vars and schema for table
  projectSchema = schema;
  schemaKeys = Object.keys(projectSchema);
  tableSchema = {
    "Name of Property": {
      type: "Text",
    },
    "Type of Property": {
      type: "Multiple Choice ReadOnly",
      options: ["Text", "Time", "Multiple Choice", "User", "File"],
    },
    "Prexisting Choices": {
      type: "ReadOnlyText",
    },
    "New Choices": {
      type: "Text",
    },
  };

  // Define table and schema vars
  tableSchemaKeys = Object.keys(tableSchema);
  let tableData = [];

  for (let i = 1; i < schemaKeys.length; i++) {
    tableData.push({});

    // Populate first column
    tableData[i - 1][tableSchemaKeys[0]] = schemaKeys[i];

    // Populate second column
    tableData[i - 1][tableSchemaKeys[1]] = projectSchema[schemaKeys[i]].type;

    // Populate third column
    if (projectSchema[schemaKeys[i]].type == "Multiple Choice") {
      tableData[i - 1][tableSchemaKeys[2]] =
        projectSchema[schemaKeys[i]].options;
    } else {
      tableData[i - 1][tableSchemaKeys[2]] = "";
    }

    // Populate fourth column
    tableData[i - 1][tableSchemaKeys[3]] =
      projectSchema[schemaKeys[i]].prexistingChoices;
    tableData[i - 1][tableSchemaKeys[3]] = "";
  }
  schemaTable = new table(tableData, tableSchema, true);
}

// Add property to table
function addProperty() {
  console.log("Adding property");
  // Define schema for adding property
  newRowTableSchema = {
    "Name of Property": {
      type: "Text",
    },
    "Type of Property": {
      type: "Multiple Choice",
      options: ["Text", "Multiple Choice", "User", "File"],
    },
    "Prexisting Choices": {
      type: "ReadOnlyText",
    },
    "New Choices": {
      type: "Text",
    },
  };

  blankTableSchema = {};
  for (let i = 0; i < tableSchemaKeys.length; i++) {
    blankTableSchema[tableSchemaKeys[i]] = "";
  }

  // Add row to table
  newRow = newRowTableSchema;
  schemaTable.addRow(blankTableSchema, newRowTableSchema);
}

// Remove last property from table
function removeProperty() {
  console.log("Removing property");
  // Check if there is only one property left and it is not a newly added property
  if (
    schemaTable.cellChildren.length > 0 &&
    schemaTable.cellChildren[schemaTable.cellChildren.length - 1][1].disabled ==
      true
  ) {
    // Set to be deleted from database
    schemaIDsToDelete.push(
      schemaTable.cellChildren[schemaTable.cellChildren.length - 1][0].value
    );
  }

  schemaTable.removeRow(undefined);
}

// Submit project to server to be created
function updateSchema() {
  console.log("Updating schema");
  let deleteOldProperties = confirm("Delete old properties (yes/no)?");
  let schemaData = schemaTable.exportTable(tableSchema);
  let updatedSchema = {};
  let schemaNames = [];

  // Format multiple choice schema
  for (let i = 0; i < schemaData.length; i++) {
    if (schemaData[i]["Type of Property"] == "Multiple Choice") {
      updatedSchema[schemaData[i]["Name of Property"]] = {
        type: schemaData[i]["Type of Property"],
        options: [schemaData[i]["Prexisting Choices"]],
        newOptions: schemaData[i]["New Choices"].split(","),
      };
    } else {
      updatedSchema[schemaData[i]["Name of Property"]] = {
        type: schemaData[i]["Type of Property"],
      };
    }
  }

  for (let i = 0; i < schemaData.length; i++) {
    if (schemaNames.includes(schemaData[i]["Name of Property"])) {
      alert("Duplicate property");
      return;
    }
    schemaNames.push(schemaData[i]["Name of Property"]);
  }

  // Send new project to server
  fetch("/editProjectSchema", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "access-control-allow-origin": "*",
    },
    body: JSON.stringify({
      oldProjectName: projectName,
      newProjectName: document.getElementById("projectName").value,
      schema: updatedSchema,
      schemaIDsToDelete: schemaIDsToDelete,
      deleteOldProperties: deleteOldProperties,
    }),
  })
    .then((response) => response.text())
    .then((data) => loadProjectPage(data));
}

// Open project page
function loadProjectPage(data) {
  console.log("Loadiing project page");
  window.location.href =
    "../project/project.html?projectName=" +
    document.getElementById("projectName").value;
}

// Cancel editing schema
function cancel() {
  console.log("Canceling edit of schema");
  window.location.href = "../project/project.html?projectName=" + projectName;
}

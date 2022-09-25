// Need to stop editing id name of issue

// Get project to open from url
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const projectName = urlParams.get('projectName')
document.getElementById("titleInput").setAttribute("value",projectName);

// Get the default schema and send it to be displayed
fetch("/getProjectSchema", {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'access-control-allow-origin': '*'
    },
    body: JSON.stringify({"projectName":projectName})
    })
    .then(response => response.json())
    .then(data => displaySchema(data));

// Get table 
let schemaTable;
let projectSchema;
let schemaKeys;
let tableSchema;
let tableSchemaKeys;
// Display schema in editable table using inputs
function displaySchema(schema) {
  projectSchema = schema;
  schemaKeys = Object.keys(projectSchema);
  tableSchema = {"Name of Property":{"type":"Text"},"Type of Property":{"type":"Multiple Choice ReadOnly","options":["Text","Time","Multiple Choice","User"]},"Prexisting Choices":{"type":"ReadOnlyText"},"New Choices":{"type":"Text"}};
  tableSchemaKeys = Object.keys(tableSchema)
  let tableData  = [];
  
  for (let i=1; i<schemaKeys.length; i++) {
    tableData.push({});
  
    tableData[i-1][tableSchemaKeys[0]] = schemaKeys[i];
    

    
    tableData[i-1][tableSchemaKeys[1]] = projectSchema[schemaKeys[i]].type;
    

    if (projectSchema[schemaKeys[i]].type == "Multiple Choice") {
      tableData[i-1][tableSchemaKeys[2]] = projectSchema[schemaKeys[i]].options;
    } else {
      tableData[i-1][tableSchemaKeys[2]] = "";
    }
    
    

    tableData[i-1][tableSchemaKeys[3]] = "";
  } 
    
  schemaTable = new table(tableData,tableSchema)
  
}

// Add property to table
function addProperty() {
  newRowTableSchema = {"Name of Property":{"type":"Text"},"Type of Property":{"type":"Multiple Choice","options":["Text","Multiple Choice","User"]},"Prexisting Choices":{"type":"ReadOnlyText"},"New Choices":{"type":"Text"}};
  blankTableSchema = {};
  for (let i=0;i<tableSchemaKeys.length;i++) {
    blankTableSchema[tableSchemaKeys[i]] = "";
  }

  schemaTable.addRow(blankTableSchema,newRowTableSchema)
  
}

// Remove last property from table
function removeProperty() {
    schemaTable.removeRow();
}


// Submit project to server to be created
function updateSchema() {

  let schemaData = schemaTable.exportTableAsText(tableSchema);
  let updatedSchema = {};

  for (let i=0; i<schemaData.length;i++) {
    if (schemaData[i]["Type of Property"]=="Multiple Choice") {
      updatedSchema[schemaData[i]["Name of Property"]] = {"type":schemaData[i]["Type of Property"],"options":schemaData[i]["Prexisting Choices"],"newOptions":schemaData[i]["New Choices"]};
    } else {
      updatedSchema[schemaData[i]["Name of Property"]] = {"type":schemaData[i]["Type of Property"]};
    }
    
  }

    // Send new project to server
    fetch("/editProjectSchema", {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'access-control-allow-origin': '*'
        },
        body: JSON.stringify({"oldProjectName":projectName,"newProjectName":document.getElementById("titleInput").value,"schema":updatedSchema})
        })
        .then(response => response.text())
        .then(data => loadProjectPage(data));
    
}

function loadProjectPage(data) {
    window.location.href = "../project/project.html?projectName="+document.getElementById("titleInput").value;
}

function cancel() {
    window.location.href = "../project/project.html?projectName="+projectName;
}
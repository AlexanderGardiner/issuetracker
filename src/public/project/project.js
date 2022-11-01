// Get project to open from url
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const projectName = urlParams.get('projectName')


// Get project from server and send to be displayed
fetch("/getProject", {
  method: 'POST',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'access-control-allow-origin': '*'
  },
  body: JSON.stringify({
    "projectName": projectName
  })
})
.then(response => response.json())
.then(data => displayProject(data));

// Display project
// Define global vars
let projectTable;
let schemaKeys;
let schema;
let project;
let issueIDsToDelete = [];
let projectFilesToDelete = [];
let downloadedFileName;

// Display project in editable table
function displayProject(data) {
  console.log("Displaying project: " + data.projectName);
  document.getElementById("timeEdited").innerHTML = "Time Edited: " + new Date(data.project[0].projectTimeEdited);
  document.getElementById("title").innerHTML = projectName;
  project = data.project;
  schema = data.schema;
  schemaKeys = Object.keys(schema);
  project.shift();

  // Create table
  projectTable = new table(project, schema);
  
}

// Add issue
function addIssue() {
  console.log("Adding issue");
  let blankData = {};

  // Create blank issue based on schema
  for (let i = 0; i < schemaKeys.length; i++) {
    if (schema[schemaKeys[i]].type == "_id") {
      blankData[schemaKeys[i]] = "Not In Database";
    } else if (schema[schemaKeys[i]].type == "Text") {
      blankData[schemaKeys[i]] = "";
    } else if (schema[schemaKeys[i]].type == "Time") {
      blankData[schemaKeys[i]] = Date.now();
    } else if (schema[schemaKeys[i]].type == "Multiple Choice") {
      blankData[schemaKeys[i]] = ""
    } else if (schema[schemaKeys[i]].type == "User") {
      blankData[schemaKeys[i]] = ""
    } else if (schema[schemaKeys[i]].type == "File") {
      blankData[schemaKeys[i]] = ""
    }
  }
  
  projectTable.addRow(blankData, schema)

}

// Remove issue
function removeIssue() {
  console.log("Removing issue");
  if (projectTable.cellChildren.length>0) {
    issueIDsToDelete.push(projectTable.cellChildren[projectTable.cellChildren.length - 1][0].value);
  }

  projectTable.removeRow();
}

// Update project to server
function updateProject() {
  console.log("Updating project");
  let project = projectTable.exportTable(schema);
  // Setup files as formdata
  let files = projectTable.files;
  let fileNames = projectTable.fileNames;
  var fd = new FormData();
  for (let i=0;i<files.length;i++) {
    fd.append(fileNames[i], files[i]);
  }

  // Post request
  fetch("/updateProject", {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'access-control-allow-origin': '*'
    },
    body: JSON.stringify({
      "projectName": projectName,
      "project": project,
      "issueIDsToDelete": issueIDsToDelete
    })
  })
  .then((response) => response.text())
  .then((data) => updateProjectFiles(projectName,files,fd));

}

// Update project files
function updateProjectFiles(projectName,files,fd) {
  console.log("Updating project files");
  if (files.length>0) {
    fetch("/updateProjectFiles?"+ new URLSearchParams({
      "projectName": projectName,
    }), {
      method: 'POST',
      body: fd
    })
    .then((response) => response.text())
    .then((data) => reloadPage(data));
    
  } else {
    reloadPage("");
    
  }
}

// Get file from server
function requestFile(fileName) {
  console.log("Reqeusting file");
  downloadedFileName = fileName;

  // Post request
  fetch("/getProjectFile", {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'access-control-allow-origin': '*'
    },
    body: JSON.stringify({
      "projectName": projectName,
      "fileName":fileName
    })
  })
  .then(response => response.blob())
  .then(data => downloadFile(data));
  
}

// Create download link and click
function downloadFile(blob) {
  console.log("Downloading file");

  // Setup blob link
  const newBlob = new Blob([blob]);
  const blobUrl = window.URL.createObjectURL(newBlob);

  // Create link
  const link = document.createElement('a');
  link.href = blobUrl;
  link.setAttribute("download",downloadedFileName);
  document.body.appendChild(link);

  // Click link
  link.dispatchEvent(
    new MouseEvent('click', { 
      bubbles: true, 
      cancelable: true, 
      view: window 
    })
  );

  // Delete link
  link.parentNode.removeChild(link);
  window.URL.revokeObjectURL(blobUrl);
}

// Reload page
function reloadPage(data) {
  console.log("Reloading page");
  window.location.reload(true);
}

// Edit schema
function editSchema() {
  console.log("Editing schema");
  window.location.href = "../editProjectSchema/editProjectSchema.html?projectName=" + projectName;
}

// Go to main page
function mainPage() {
  console.log("Redirecing to main page");
  window.location.href = "../";
}
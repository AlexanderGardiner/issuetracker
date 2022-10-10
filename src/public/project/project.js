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



let projectTable;
let schemaKeys;
let schema;
let project;
let issueIDsToDelete = [];
let projectFilesToDelete = [];
let downloadedFileName;

// Display project in editable table
function displayProject(data) {
  

  document.getElementById("timeEdited").innerHTML = "Time Edited: " + new Date(data.project[0].projectTimeEdited);
  document.getElementById("title").innerHTML = projectName;
  project = data.project;
  schema = data.schema;
  schemaKeys = Object.keys(schema);
  // Need to add users
  project.shift();

  projectTable = new table(project, schema);
}

function addIssue() {
  // Add issue
  let blankData = {}
  
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

function removeIssue() {
  if (projectTable.cellChildren.length>0) {
    issueIDsToDelete.push(projectTable.cellChildren[projectTable.cellChildren.length - 1][0].value);
  }
  

  projectTable.removeRow();
}

function updateProject() {
  let project = projectTable.exportTable(schema);
  // Send data to server
  let files = projectTable.files;
  let fileNames = projectTable.fileNames;
  var fd = new FormData();
  for (let i=0;i<files.length;i++) {
    fd.append(fileNames[i], files[i]);
  }
  
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
    }).then((response) => response.text())
    .then((data) => reloadPage(data));
  if (files.length>0) {
    fetch("/updateProjectFiles?"+ new URLSearchParams({
      "projectName": projectName,
    }), {
      method: 'POST',
      body: fd
  
    })
  }
  


}

function requestFile(fileName) {
  downloadedFileName = fileName;
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
function downloadFile(blob) {

  const newBlob = new Blob([blob]);
  
  const blobUrl = window.URL.createObjectURL(newBlob);

  const link = document.createElement('a');
  link.href = blobUrl;

  link.setAttribute("download",downloadedFileName);
  document.body.appendChild(link);
  link.click();
  link.parentNode.removeChild(link);
  // clean up Url
  window.URL.revokeObjectURL(blobUrl);
}

function reloadPage(data) {
  window.location.reload(true);
}

function editSchema() {
  window.location.href = "../editProjectSchema/editProjectSchema.html?projectName=" + projectName;
}

function mainPage() {
  window.location.href = "../";
}
// Get project to open from url
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const projectName = urlParams.get("projectName");

// Get project from server and send to be displayed
fetch("/issuetracker/getProject", {
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
  .then((data) => displayProject(data));

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

// Define global vars
let projectTable;
let addRowTable;
let schemaKeys;
let schema;
let project;
let issueIDsToDelete = [];
let projectFileIDsToDelete = [];
let downloadedFileName;

// Display project in editable table
function displayProject(data) {
  if (data.hasOwnProperty("redirect")) {
    window.location.href = "/issuetracker/login/login.html";
  }

  console.log("Displaying project: " + projectName);
  console.log(data);
  document.getElementById("timeEdited").innerHTML =
    "Time Edited: " + new Date(data.project[0].projectTimeEdited);
  document.getElementById("title").innerHTML = projectName;
  project = data.project;
  schema = data.schema;
  schemaKeys = Object.keys(schema);
  project.shift();

  addRowTable = new table({}, schema, false);
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
      blankData[schemaKeys[i]] = "";
    } else if (schema[schemaKeys[i]].type == "User") {
      blankData[schemaKeys[i]] = "";
    } else if (schema[schemaKeys[i]].type == "File") {
      blankData[schemaKeys[i]] = "";
    }
  }

  addRowTable.addRow(blankData, schema, {});

  // Create table
  projectTable = new table(project, schema, true);
}

// Add issue
function addIssue() {
  let files = {};
  for (let i = 0; i < schemaKeys.length; i++) {
    if (schema[schemaKeys[i]].type == "File") {
      files[i] = addRowTable.cellChildren[0][i].children[1].children[0];
    }
  }
  console.log(addRowTable.exportTable(schema));
  projectTable.addRow(addRowTable.exportTable(schema)[0], schema, files);
}

// Remove issue
function removeIssue(issueIndex) {
  console.log("Removing issue");
  if (projectTable.cellChildren[issueIndex][0].value != "Not In Database") {
    issueIDsToDelete.push(projectTable.cellChildren[issueIndex][0].innerHTML);

    for (let i = 0; i < schemaKeys.length; i++) {
      if (schema[schemaKeys[i]].type == "File") {
        if (projectTable.cellChildren[issueIndex][i].fileID != undefined) {
          prepareDeletionOfOldFile(
            projectTable.cellChildren[issueIndex][i].fileID
          );
        }
      }
    }
    projectTable.removeRow(issueIndex);
  } else {
    projectTable.removeRow(issueIndex);
  }
}

// Update project to server
function updateProjectData(project, filterTriggered) {
  console.log("Updating project");
  if (!filterTriggered) {
    // Post request
    fetch("/issuetracker/updateProject", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "access-control-allow-origin": "*",
      },
      body: JSON.stringify({
        projectName: projectName,
        project: project,
        issueIDsToDelete: issueIDsToDelete,
        projectFileIDsToDelete: projectFileIDsToDelete,
        schema: schema,
        schemaKeys: schemaKeys,
      }),
    })
      .then((response) => response.text())
      .then((data) => reloadProject());
  } else {
    console.log("Test");
    // Post request
    fetch("/issuetracker/updateProject", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "access-control-allow-origin": "*",
      },
      body: JSON.stringify({
        projectName: projectName,
        project: project,
        issueIDsToDelete: issueIDsToDelete,
        projectFileIDsToDelete: projectFileIDsToDelete,
        schema: schema,
        schemaKeys: schemaKeys,
      }),
    })
      .then((response) => response.text())
      .then((data) => filterProject());
  }
}

// Update project files
function updateProject(filterTriggered) {
  // Setup files as formdata
  let project = projectTable.exportTable(schema);
  let files = projectTable.files;
  let fileNames = projectTable.fileNames;
  var fd = new FormData();
  for (let i = 0; i < files.length; i++) {
    fd.append(
      fileNames[i] + i.toString(),
      files[i],
      fileNames[i] + i.toString()
    );
  }

  if (filterTriggered == undefined) {
    filterTriggered = false;
  }
  console.log("Updating project files");
  if (files.length > 0) {
    fetch(
      "/issuetracker/updateProjectFiles?" +
        new URLSearchParams({
          projectName: projectName,
        }),
      {
        method: "POST",
        body: fd,
      }
    )
      .then((response) => response.text())
      .then((data) => updateProjectData(project, filterTriggered));
  } else {
    updateProjectData(project, filterTriggered);
  }
}

function prepareDeletionOfOldFile(fileID) {
  projectFileIDsToDelete.push(fileID);
}
// Get file from server
function requestFile(fileName, issueID, propertyName) {
  console.log("Reqeusting file");
  downloadedFileName = fileName;

  // Post request
  fetch("/issuetracker/getProjectFile", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "access-control-allow-origin": "*",
    },
    body: JSON.stringify({
      projectName: projectName,
      fileName: fileName,
      issueID: issueID,
      propertyName: propertyName,
    }),
  })
    .then((response) => response.blob())
    .then((data) => downloadFile(data));
}

// Create download link and click
function downloadFile(blob) {
  console.log("Downloading file");

  // Setup blob link
  const newBlob = new Blob([blob]);
  const blobUrl = window.URL.createObjectURL(newBlob);

  // Create link
  const link = document.createElement("a");
  link.href = blobUrl;
  link.setAttribute("download", downloadedFileName);
  document.body.appendChild(link);

  // Click link
  link.dispatchEvent(
    new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      view: window,
    })
  );

  // Delete link
  link.parentNode.removeChild(link);
  window.URL.revokeObjectURL(blobUrl);
}

function filterProjectUpdate() {
  let updateProjectConfirm = confirm("Update Project?");
  if (updateProjectConfirm) {
    updateProject(true);
  } else {
    filterProject();
  }
}

function filterProject() {
  let filters = projectTable.getFilters();

  addRowTable.table.remove();
  projectTable.table.remove();

  // Get project from server and send to be displayed
  fetch("/issuetracker/getProject", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "access-control-allow-origin": "*",
    },
    body: JSON.stringify({
      projectName: projectName,
      filters: filters,
    }),
  })
    .then((response) => response.json())
    .then((data) => displayProject(data));
}

function reloadProject() {
  addRowTable.table.remove();
  projectTable.table.remove();

  // Get project from server and send to be displayed
  fetch("/issuetracker/getProject", {
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
    .then((data) => displayProject(data));
}

// Reload page
function reloadPage(data) {
  console.log("Reloading page");
  window.location.reload(true);
}

// Edit schema
function editSchema() {
  console.log("Editing schema");
  window.location.href =
    "../editProjectSchema/editProjectSchema.html?projectName=" + projectName;
}

// Go to main page
function mainPage() {
  console.log("Redirecing to main page");
  window.location.href = "../";
}

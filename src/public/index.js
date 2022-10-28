// Get project names and send them to load function
fetch("/getProjectNames", {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'access-control-allow-origin': '*'
        }
    })
    .then(response => response.json())
    .then(data => displayProjectNames(data));

// Display projects in a list
function displayProjectNames(projectNames) {
  console.log("Displaying Project Names")
  // Array to access created buttons
  projectButtons = [];
  deleteProjectButtons = [];
  buttonsDivs = [];

  // Create buttons
  for (let i = 0; i < projectNames.length; i++) {
    buttonsDivs.push(document.createElement("div"));
    buttonsDivs[i].classList.add("buttonsDivs");

    // Create buttons
    projectButtons.push(document.createElement("button"));
    projectButtons[i].innerHTML = projectNames[i];
    projectButtons[i].classList.add("projectSelectionButton");
    projectButtons[i].onclick = function () {
        loadProject(projectNames[i])
    };
    buttonsDivs[i].appendChild(projectButtons[i]);

    // Create delete buttons
    deleteProjectButtons.push(document.createElement("button"));
    deleteProjectButtons[i].classList.add("deleteProjectButton");
    deleteProjectButtons[i].onclick = function () {
        deleteProjectConfirmation(projectNames[i])
    };
    deleteProjectButtons[i].innerHTML = "Delete Project";
    buttonsDivs[i].appendChild(deleteProjectButtons[i]);
  
    document.getElementById("projectDiv").appendChild(buttonsDivs[i]);

  }
}

// Load selected project
function loadProject(projectName) {
  console.log("Loading Project: " + projectName);
    window.location.href = "project/project.html?projectName=" + projectName;
}

// Set page location to create project
function createNewProject() {
  console.log("Creating New Project");
    window.location.href = "newProject/newProject.html";
}

// Delete project with a confirmation
function deleteProjectConfirmation(projectName) {
  let confirmation = prompt("Are you sure? Enter " + projectName + " to confirm.");
  if (confirmation == projectName) {
    console.log("Deleting Project " + projectName);
    fetch("/deleteProject", {
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
    .then(response => response.text())
    .then(data => reloadPage(data));
  }
}

// Reload page
function reloadPage(data) {
  console.log("Reloading Page");
  window.location.reload(true)
}
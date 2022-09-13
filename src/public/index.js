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

// Display projects as buttons
function displayProjectNames(projectNames) {
    // Array to access created buttons
    projectButtons = [];
    deleteProjectButtons = [];
    buttonsDivs = [];
    // Create buttons
    for (let i=0;i<projectNames.length;i++) {

        buttonsDivs.push(document.createElement("div"));
        buttonsDivs[i].classList.add("buttonsDivs");

      
        projectButtons.push(document.createElement("button"));
        
        projectButtons[i].innerHTML = projectNames[i];
        projectButtons[i].classList.add("projectSelectionButton");
        projectButtons[i].onclick = function() { loadProject(projectNames[i])};

      
        buttonsDivs[i].appendChild(projectButtons[i]);

        deleteProjectButtons.push(document.createElement("button"));
        deleteProjectButtons[i].classList.add("deleteProjectButton");
        deleteProjectButtons[i].onclick = function() { deleteProjectConfirmation(projectNames[i])};
        deleteProjectButtons[i].innerHTML = "Delete Project";
        buttonsDivs[i].appendChild(deleteProjectButtons[i]);
        document.getElementById("projectDiv").appendChild(buttonsDivs[i]);

    }
}

// Load selected project
function loadProject(projectName) {
    window.location.href = "/project.html?projectName=" + projectName;
}

// Set page location to create project
function createNewProject() {
    window.location.href = "/newProject.html";
}

function deleteProjectConfirmation(projectName) {
    let confirmation = prompt("Are you sure? Enter "+projectName+" to confirm.");
    if (confirmation==projectName) {
        console.log("Deleting Project " + projectName);
        fetch("/deleteProject", {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'access-control-allow-origin': '*'
            },
            body: JSON.stringify({"projectName":projectName})
            }).then(response => response.text())
            .then(data => reloadPage(data));
    }
    

}

function reloadPage(data) {
    window.location.reload(true)
}


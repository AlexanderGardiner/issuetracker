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

    // Create buttons
    for (let i=0;i<projectNames.length;i++) {
        projectButtons.push(document.createElement("button"));
        projectButtons[i].innerHTML = projectNames[i];
        projectButtons[i].classList.add("projectButton");
        projectButtons[i].onclick = function() { loadProject(projectNames[i])};
        document.body.appendChild(projectButtons[i]);
        
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



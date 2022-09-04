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

function displayProjectNames(projectNames) {
    projectButtons = [];
    for (let i=0;i<projectNames.length;i++) {
        projectButtons.push(document.createElement("button"));
        projectButtons[i].innerHTML = projectNames[i];
        projectButtons[i].classList.add("projectButton");
        document.body.appendChild(projectButtons[i]);
        
    }
}



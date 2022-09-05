const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const projectName = urlParams.get('projectName')
console.log(projectName);

fetch("/getProject", {
  method: 'POST',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'access-control-allow-origin': '*'
  },
  body: JSON.stringify({"projectName":projectName})
  })
  .then(response => response.json())
  .then(data => displayProject(data));


function displayProject(data) {
  console.log("test")
  console.log(JSON.stringify(data))
  //let projectData = data.project;
  //let schema = data.schema;
  
}

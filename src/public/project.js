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
    body: {"ProjectName":"test"}
    })
    .then(response => response.json())
    .then(data => displayProjectNames(data));

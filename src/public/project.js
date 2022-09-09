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
  body: JSON.stringify({"projectName":projectName})
  })
  .then(response => response.json())
  .then(data => displayProject(data));

// Get table from html
let table = document.getElementById("propertyTable");

// Display project in editable table
function displayProject(data) {

  
  //TODO: need to add header for table (schema)
  let properties = [];

  let header;
  let schemaKeys = Object.keys(data.schema)
  let headerRow = [];
  let headerRowInputs = [];

  header = (table.insertRow(-1));

  headerRow.push(header.insertCell(0));
  headerRowInputs.push(document.createElement("Input"));
  headerRowInputs[0].setAttribute("type", "text");
  headerRowInputs[0].setAttribute("value", "ID");
  headerRowInputs[0].classList.add("tableinput");

  headerRow[0].appendChild(headerRowInputs[0])

  for (let i=1;i<schemaKeys.length+1;i++) {
    
    headerRow.push(header.insertCell(i));
    headerRowInputs.push(document.createElement("Input"));
    headerRowInputs[i].setAttribute("type", "text");
    headerRowInputs[i].setAttribute("value", JSON.stringify(schemaKeys[i-1]).replaceAll('"', ''));
    headerRowInputs[i].classList.add("tableinput");

    headerRow[i].appendChild(headerRowInputs[i])

  }

  
  
  for (let i=0;i<data.project.length;i++) {
    let projectKeys = Object.keys(data.project[i]);

    // Vars to access objects
    let propertiesInRow = [];
    let propertiesInRowInput = [];

    properties.push(table.insertRow(-1));

    // Create columns based on schema and populate with data
    for (let j=0;j<projectKeys.length;j++) {
      propertiesInRow.push(properties[i].insertCell(j));
      propertiesInRowInput.push(document.createElement("Input"));
      propertiesInRowInput[j].setAttribute("type", "text");
      propertiesInRowInput[j].setAttribute("value", JSON.stringify(data.project[i][projectKeys[j]]).replaceAll('"', ''));
      propertiesInRowInput[j].classList.add("tableinput");

      propertiesInRow[j].appendChild(propertiesInRowInput[j])
    }
      
  }
  // TODO: need to set up other input types for issues (multiple choice etc)

  
}

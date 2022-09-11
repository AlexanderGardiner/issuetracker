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
let schemaKeys;
let schema;
// Display project in editable table
function displayProject(data) {
  document.getElementById("timeEdited").innerHTML = "Time Edited: " + data.project[0].projectTimeEdited;
  document.getElementById("title").innerHTML = projectName;
  
  let properties = [];
  schemaKeys = Object.keys(data.schema)
  schema = data.schema;
  // Vars for headers
  let header;
  let headerRow = [];
  let headerRowInputs = [];

  // Create ID header
  header = (table.insertRow(-1));
  headerRow.push(header.insertCell(0));
  headerRowInputs.push(document.createElement("h1"));
  headerRowInputs[0].innerHTML =  "ID";
  headerRowInputs[0].classList.add("tableinput");

  headerRow[0].appendChild(headerRowInputs[0])

  // Create other headers
  for (let i=1;i<schemaKeys.length+1;i++) {
    
    headerRow.push(header.insertCell(i));
    headerRowInputs.push(document.createElement("h1"));
    headerRowInputs[i].innerHTML = JSON.stringify(schemaKeys[i-1]).replaceAll('"', '');
    headerRowInputs[i].classList.add("tableinput");

    headerRow[i].appendChild(headerRowInputs[i])

  }

  
  
  for (let i=1;i<data.project.length;i++) {

    // Vars to access objects
    let propertiesInRow = [];
    let propertiesInRowInput = [];

    properties.push(table.insertRow(-1));

    // Create ID column
    propertiesInRow.push(properties[i-1].insertCell(0));
    propertiesInRowInput.push(document.createElement("textarea"));
    propertiesInRowInput[0].setAttribute("readonly", "true");
    propertiesInRowInput[0].innerHTML = ("value", JSON.stringify(data.project[i]._id).replaceAll('"', ''));
    propertiesInRowInput[0].classList.add("tabletextarea");
    propertiesInRow[0].appendChild(propertiesInRowInput[0])
    
    // Create columns based on schema and populate with data
    for (let j=1;j<schemaKeys.length+1;j++) {
      
      

      // Create other types of cells
      let typeOfCell = data.schema[schemaKeys[j-1]].type;
      if (typeOfCell=="Text") {
        // Create cell if it's type is text
        propertiesInRow.push(properties[i-1].insertCell(j));
        propertiesInRowInput.push(document.createElement("textarea"));
        propertiesInRowInput[j].innerHTML = ("value", JSON.stringify(data.project[i][schemaKeys[j-1]]).replaceAll('"', ''));
        propertiesInRowInput[j].classList.add("tabletextarea");
      } else if (typeOfCell=="Time") {
        // Create cell if it's type is time
        propertiesInRow.push(properties[i-1].insertCell(j));
        propertiesInRowInput.push(document.createElement("textarea"));
        propertiesInRowInput[j].setAttribute("readonly", "true");
        console.log(JSON.stringify(data.project[i][schemaKeys[j-1]]).replaceAll('"', ''))
        propertiesInRowInput[j].innerHTML = ("value", JSON.stringify(data.project[i][schemaKeys[j-1]]).replaceAll('"', ''));
        propertiesInRowInput[j].classList.add("tabletextarea");
      } else if (typeOfCell=="Multiple Choice") {
        // Create cell if it's type is multiple choice
        let options = data.schema[schemaKeys[j-1]].options;
        let selectedIndex = 0;
        propertiesInRow.push(properties[i-1].insertCell(j));
        propertiesInRowInput.push(document.createElement("Select"));
        for (let k = 0; k < options.length; k++) {
          if (options[k]==data.project[i][schemaKeys[j-1]]) {
            selectedIndex = k;
          }
          let option = document.createElement("option");
          option.value = options[k];
          option.text = options[k];
          propertiesInRowInput[j].appendChild(option);
        }
        propertiesInRowInput[j].selectedIndex = selectedIndex;
        propertiesInRowInput[j].classList.add("tableinput");
      } else if (typeOfCell=="User") {
        // Create cell if it's type is user
        propertiesInRow.push(properties[i-1].insertCell(j));
        propertiesInRowInput.push(document.createElement("textarea"));
        propertiesInRowInput[j].innerHTML = ("value", JSON.stringify(data.project[i][schemaKeys[j-1]]).replaceAll('"', ''));
        propertiesInRowInput[j].classList.add("tabletextarea");
        // TODO: link to users when setup login system
      }
      
      
      
      
      
      // Add to table
      

      propertiesInRow[j].appendChild(propertiesInRowInput[j])
    }
      
  }


  // Set width of td to be size of page
  let tdElements = document.getElementsByTagName("td");

  for(let i = 0; i < tdElements.length; i++) {
    tdElements[i].style.width = "1000px";
  }
}

function addIssue() {
  let propertiesInRow = [];
  let propertiesInRowInput = [];

  let properties  = table.insertRow(-1);

  // Create columns based on schema and populate with data
  for (let j=0;j<schemaKeys.length+1;j++) {
    
    
    if (j==0) {
      // Create ID cells
      propertiesInRow.push(properties.insertCell(j));
      propertiesInRowInput.push(document.createElement("textarea"));
      propertiesInRowInput[j].setAttribute("readonly", "true");
      propertiesInRowInput[j].classList.add("tabletextarea");
    } else {
      
      // Create other types of cells
      let typeOfCell = schema[schemaKeys[j-1]].type;
      if (typeOfCell=="Text") {
        // Create cell if it's type is text
        propertiesInRow.push(properties.insertCell(j));
        propertiesInRowInput.push(document.createElement("textarea"));
        propertiesInRowInput[j].classList.add("tabletextarea");
      } else if (typeOfCell=="Time") {
        // Create cell if it's type is time
        propertiesInRow.push(properties.insertCell(j));
        propertiesInRowInput.push(document.createElement("textarea"));
        propertiesInRowInput[j].setAttribute("readonly", "true");
        propertiesInRowInput[j].innerHTML = ("value", (new Date(Date.now())).toString());
        propertiesInRowInput[j].classList.add("tabletextarea");
      } else if (typeOfCell=="Multiple Choice") {
        // Create cell if it's type is multiple choice
        let options = schema[schemaKeys[j-1]].options;
        let selectedIndex = 0;
        propertiesInRow.push(properties.insertCell(j));
        propertiesInRowInput.push(document.createElement("Select"));
        for (let k = 0; k < options.length; k++) {
          let option = document.createElement("option");
          option.value = options[k];
          option.text = options[k];
          propertiesInRowInput[j].appendChild(option);
        }
        propertiesInRowInput[j].selectedIndex = selectedIndex;
        propertiesInRowInput[j].classList.add("tableinput");
      } else if (typeOfCell=="User") {
        // Create cell if it's type is user
        propertiesInRow.push(properties.insertCell(j));
        propertiesInRowInput.push(document.createElement("textarea"));
        propertiesInRowInput[j].classList.add("tabletextarea");
        // TODO: link to users when setup login system
      }
    }
    
    
    
    
    // Add cells to table
    

    propertiesInRow[j].appendChild(propertiesInRowInput[j])
  }
}

function removeIssue() {
  table.deleteRow(-1);
}
function updateProject() {
  let project = [];
  // Get project data from HTML
  for (let i = 0, row; row = table.rows[i]; i++) {
      project.push({})
      let rowData = row.cells;
      for (let j=0; j<rowData.length; j++) {
        if (j==0) {
          project[i].ID = rowData[j].children[0].value;
        } else {
          project[i][schemaKeys[j-1]] = rowData[j].children[0].value;
        }
        
      }
      
          
  }
  // Remove blank first column
  project.shift();
  
  // Send data to server
  fetch("/updateProject", {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'access-control-allow-origin': '*'
    },
    body: JSON.stringify({"projectName":projectName,"project":project})
    }).then((response) => response.text())
    .then((data) => reloadPage(data));

    

}

function reloadPage(data) {
  window.location.reload(true)
}

function editSchema() {
  window.location.href = "./editProjectSchema.html?projectName="+projectName;
}

function mainPage() {
  window.location.href = "./";
}

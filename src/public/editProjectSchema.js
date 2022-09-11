// Get project to open from url
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const projectName = urlParams.get('projectName')
document.getElementById("titleInput").setAttribute("value",projectName);

// Get the default schema and send it to be displayed
fetch("/getProjectSchema", {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'access-control-allow-origin': '*'
    },
    body: JSON.stringify({"projectName":projectName})
    })
    .then(response => response.json())
    .then(data => displaySchema(data));

// Get table from html
let table = document.getElementById("propertySelectorTable");

// Display schema in editable table using inputs
function displaySchema(schema) {
    // Lists to access created elements
    let properties = [];
    let propertyNames = [];
    let propertyNamesInput = [];
    let propertyTypes = [];
    let propertyTypesInput = [];
    let propertyMultipleChoices = [];
    let propertyMultipleChoicesInput = [];
    let propertyNewMultipleChoices = [];
    let propertyNewMultipleChoicesInput = [];

    let keys = Object.keys(schema)


    // Create elements of table and create inputs of specific type for each column
    for (let i=0;i<keys.length;i++) {
        // Column 1 creation
        properties.push(table.insertRow(-1));
        propertyNames.push(properties[i].insertCell(0))
        propertyNamesInput.push(document.createElement("Input"));
        propertyNamesInput[i].setAttribute("type", "text");
        propertyNamesInput[i].setAttribute("value", keys[i]);
        propertyNamesInput[i].classList.add("tableinput");
        propertyNames[i].appendChild(propertyNamesInput[i]);

        // Column 2 creation
        propertyTypes.push(properties[i].insertCell(1));
        propertyTypesInput.push(document.createElement("Input"));
        propertyTypesInput[i].setAttribute("type", "text");
        propertyTypesInput[i].setAttribute("value", schema[keys[i]].type);
        propertyTypesInput[i].setAttribute("readonly", "true");
        
        propertyTypesInput[i].classList.add("tableinput");
        propertyTypes[i].appendChild(propertyTypesInput[i]);
        
        // Column 3 creation
        propertyMultipleChoices.push(properties[i].insertCell(2))
        propertyMultipleChoices[i].classList.add("multipleChoices")
        propertyMultipleChoicesInput.push(document.createElement("Input"));
        propertyMultipleChoicesInput[i].setAttribute("type", "text");
        propertyMultipleChoicesInput[i].setAttribute("readonly", "true");
        propertyMultipleChoicesInput[i].classList.add("tableinput");
        if (schema[keys[i]].type=="Multiple Choice") {
            let optionsOutput = []
            for (let j=0; j<schema[keys[i]].options.length;j++) {
                optionsOutput.push(schema[keys[i]].options[j]);
            }
            propertyMultipleChoicesInput[i].setAttribute("value", optionsOutput);
        }
        propertyMultipleChoices[i].appendChild(propertyMultipleChoicesInput[i]);



        // Column 4 creation
        propertyNewMultipleChoices.push(properties[i].insertCell(3))
        propertyNewMultipleChoices[i].classList.add("multipleChoices")
        propertyNewMultipleChoicesInput.push(document.createElement("Input"));
        propertyNewMultipleChoicesInput[i].setAttribute("type", "text");
        propertyNewMultipleChoicesInput[i].classList.add("tableinput");
        propertyNewMultipleChoicesInput[i].setAttribute("value", "");
        propertyNewMultipleChoices[i].appendChild(propertyNewMultipleChoicesInput[i]);
    }
    
    // Set width of td to be size of page
    let tdElements = document.getElementsByTagName("td");

    for(let i = 0; i < tdElements.length; i++) {
        tdElements[i].style.width = "1000px";
    }
}

// Add property to table
function addProperty() {
    // Vars to access created elements
    let properties;
    let propertyNames;
    let propertyNamesInput;
    let propertyTypes;
    let propertyTypesInput;
    let propertyMultipleChoices;
    let propertyMultipleChoicesInput;
    let propertyNewMultipleChoices = [];
    let propertyNewMultipleChoicesInput = [];
    let options = ["Text","Time","Multiple Choice","User"]

    // Column 1
    properties = (table.insertRow(-1));
    propertyNames =(properties.insertCell(0))
    propertyNamesInput = (document.createElement("Input"));
    propertyNamesInput.setAttribute("type", "text");
    propertyNamesInput.setAttribute("value", "");
    propertyNamesInput.classList.add("tableinput");
    propertyNames.appendChild(propertyNamesInput);

    // Column 2
    propertyTypes = (properties.insertCell(1));
    propertyTypesInput = (document.createElement("Select"));
    for (var j = 0; j < options.length; j++) {
        var option = document.createElement("option");
        option.value = options[j];
        option.text = options[j];
        propertyTypesInput.appendChild(option);
    }
    propertyTypesInput.selectedIndex = 0;
    propertyTypesInput.classList.add("tableinput");
    propertyTypes.appendChild(propertyTypesInput);
    
    // Column 3
    propertyMultipleChoices = (properties.insertCell(2))
    propertyMultipleChoices.classList.add("multipleChoices")
    propertyMultipleChoicesInput = (document.createElement("Input"));
    propertyMultipleChoicesInput.setAttribute("type", "text");
    propertyMultipleChoicesInput.classList.add("tableinput");
    propertyMultipleChoicesInput.setAttribute("value", "");
    propertyMultipleChoices.appendChild(propertyMultipleChoicesInput);
    
    // Column 4
    propertyNewMultipleChoices = (properties.insertCell(2))
    propertyNewMultipleChoices.classList.add("multipleChoices")
    propertyNewMultipleChoicesInput = (document.createElement("Input"));
    propertyNewMultipleChoicesInput.setAttribute("type", "text");
    propertyNewMultipleChoicesInput.setAttribute("readonly", "true");
    propertyNewMultipleChoicesInput.classList.add("tableinput");
    propertyNewMultipleChoicesInput.setAttribute("value", "");
    propertyNewMultipleChoices.appendChild(propertyNewMultipleChoicesInput);

}

// Remove last property from table
function removeProperty() {
    table.deleteRow(-1);
}


// Submit project to server to be created
function updateSchema() {
    let schema = {};
    
    for (let i = 0, row; row = table.rows[i]; i++) {
        let rowData = row.cells;
        if (rowData[0].children.length>0) {
            schema[rowData[0].children[0].value] = {"type":"text"};
            schema[rowData[0].children[0].value].type = rowData[1].children[0].value;
            if (rowData[1].children[0].value=="Multiple Choice") {
                let options = rowData[2].children[0].value.split(",");
                let newOptions = rowData[3].children[0].value.split(",");
                schema[rowData[0].children[0].value].options = options;
                schema[rowData[0].children[0].value].newOptions = newOptions;

            }
            
        }
            
    }
    
    // Send new project to server
    fetch("/editProjectSchema", {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'access-control-allow-origin': '*'
        },
        body: JSON.stringify({"oldProjectName":projectName,"newProjectName":document.getElementById("titleInput").value,"schema":schema})
        })
        .then(response => response.text())
        .then(data => loadProjectPage(data));
    
}

function loadProjectPage(data) {
    window.location.href = "/project.html?projectName="+document.getElementById("titleInput").value;
}

function cancel() {
    window.location.href = "./";
}
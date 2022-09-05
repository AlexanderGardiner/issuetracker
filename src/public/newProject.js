fetch("/getDefaultSchema", {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'access-control-allow-origin': '*'
    }
    })
    .then(response => response.json())
    .then(data => displaySchema(data));

let table = document.getElementById("propertySelectorTable");
function displaySchema(schema) {
    let properties = [];
    let propertyNames = [];
    let propertyNamesInput = [];
    let propertyTypes = [];
    let propertyTypesSelect = [];
    let propertyMultipleChoices = [];
    let propertyMultipleChoicesInput = [];
    let options = ["Text","Time","Multiple Choice","User"]
    let keys = Object.keys(schema.Default)
    for (let i=0;i<keys.length;i++) {
        properties.push(table.insertRow(-1));
        propertyNames.push(properties[i].insertCell(0))
        propertyNamesInput.push(document.createElement("Input"));
        propertyNamesInput[i].setAttribute("type", "text");
        propertyNamesInput[i].setAttribute("value", keys[i]);
        propertyNamesInput[i].classList.add("tableinput");
        propertyNames[i].appendChild(propertyNamesInput[i]);

        propertyTypes.push(properties[i].insertCell(1));
        propertyTypesSelect.push(document.createElement("Select"));
        for (var j = 0; j < options.length; j++) {
            var option = document.createElement("option");
            option.value = options[j];
            option.text = options[j];
            propertyTypesSelect[i].appendChild(option);
            if (schema.Default[keys[i]].type==options[j]) {
                propertyTypesSelect[i].selectedIndex = j;
            } 
        }
        propertyTypesSelect[i].classList.add("tableinput");
        propertyTypes[i].appendChild(propertyTypesSelect[i]);
        
        propertyMultipleChoices.push(properties[i].insertCell(2))
        propertyMultipleChoices[i].classList.add("multipleChoices")
        propertyMultipleChoicesInput.push(document.createElement("Input"));
        propertyMultipleChoicesInput[i].setAttribute("type", "text");
        
        propertyMultipleChoicesInput[i].classList.add("tableinput");
        if (schema.Default[keys[i]].type=="Multiple Choice") {
            let optionsOutput = []
            for (let j=0; j<schema.Default[keys[i]].options.length;j++) {
                optionsOutput.push(schema.Default[keys[i]].options[j]);
            }
            propertyMultipleChoicesInput[i].setAttribute("value", optionsOutput);
        }
        propertyMultipleChoices[i].appendChild(propertyMultipleChoicesInput[i]);
    }
    
    
}

function addProperty() {
    let properties;
    let propertyNames;
    let propertyNamesInput;
    let propertyTypes;
    let propertyTypesSelect;
    let propertyMultipleChoices;
    let propertyMultipleChoicesInput;
    let options = ["Text","Time","Multiple Choice","User"]
    properties = (table.insertRow(-1));
    propertyNames =(properties.insertCell(0))
    propertyNamesInput = (document.createElement("Input"));
    propertyNamesInput.setAttribute("type", "text");
    propertyNamesInput.setAttribute("value", "");
    propertyNamesInput.classList.add("tableinput");
    propertyNames.appendChild(propertyNamesInput);

    propertyTypes = (properties.insertCell(1));
    propertyTypesSelect = (document.createElement("Select"));
    for (var j = 0; j < options.length; j++) {
        var option = document.createElement("option");
        option.value = options[j];
        option.text = options[j];
        propertyTypesSelect.appendChild(option);
    }
    propertyTypesSelect.selectedIndex = 0;
    propertyTypesSelect.classList.add("tableinput");
    propertyTypes.appendChild(propertyTypesSelect);
    
    propertyMultipleChoices = (properties.insertCell(2))
    propertyMultipleChoices.classList.add("multipleChoices")
    propertyMultipleChoicesInput = (document.createElement("Input"));
    propertyMultipleChoicesInput.setAttribute("type", "text");
    propertyMultipleChoicesInput.classList.add("tableinput");
    propertyMultipleChoicesInput.setAttribute("value", "");
    propertyMultipleChoices.appendChild(propertyMultipleChoicesInput);
}

function removeProperty() {
    table.deleteRow(-1);
}
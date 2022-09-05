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
        propertyMultipleChoicesInput.push(document.createElement("Input"));
        propertyMultipleChoicesInput[i].setAttribute("type", "text");
        
        propertyMultipleChoicesInput[i].classList.add("tableinput");
        if (schema.Default[keys[i]].type=="Multiple Choice") {
            console.log('test')
            propertyMultipleChoicesInput[i].setAttribute("value", JSON.stringify(schema.Default[keys[i]].options).slice(1, -1));
        }
        propertyMultipleChoices[i].appendChild(propertyMultipleChoicesInput[i]);
    }
    
    
}

function addNewProperty() {

}
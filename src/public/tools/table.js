class table {
  constructor(tableData,schema) {
    // Table data and schema both in format for a project but can be used for other tables

    // Initialize table and prepare variables
    this.table = document.createElement("table");
    document.body.appendChild(this.table);
    this.rows = []; 
    this.cells = [];
    this.cellChildren = [];
    this.schemaKeys = Object.keys(schema);
    this.schemaDataTypes = [];
    for (let i=0; i<this.schemaKeys.length;i++) {
      this.schemaDataTypes.push(schema[this.schemaKeys[i]].type);
    }

    // Create headers
    this.rows.push(this.table.insertRow(-1));
    this.cells.push([]);
    this.cellChildren.push([]);
    for (let i=0; i<this.schemaKeys.length;i++) {
      this.cells[0].push(this.rows[0].insertCell(-1));
      this.cellChildren[0].push(document.createElement("h1"));
      this.cells[0][i].appendChild(this.cellChildren[0][i]);
      this.cellChildren[0][i].innerHTML = this.schemaKeys[i];
    }

    
    // Create body
    
    
    for (let i=1;i<tableData.length+1;i++) {
      this.rows.push(this.table.insertRow(-1));
      this.cells.push([]);
      this.cellChildren.push([]);
      
      for (let j=0;j<this.schemaDataTypes.length;j++) {
        this.cells[i].push(this.rows[i].insertCell(-1));
        
        if (this.schemaDataTypes[j]=="Text") {
          this.cellChildren[i].push(document.createElement("textarea"));
          this.cells[i][j].appendChild(this.cellChildren[i][j]);
          this.cellChildren[i][j].innerHTML = tableData[i-1][this.schemaKeys[j]];
          
        } else if (this.schemaDataTypes[j]=="Time") {
          this.cellChildren[i].push(document.createElement("textarea"));
          this.cells[i][j].appendChild(this.cellChildren[i][j]);
          this.cellChildren[i][j].innerHTML = new Date(tableData[i-1][this.schemaKeys[j]]);
        } else if (this.schemaDataTypes[j]=="Multiple Choice") {
          this.cellChildren[i].push(document.createElement("select"));
          let options = schema[this.schemaKeys[j]].options;
          let selectedIndex;
          for (let k=0; k<options.length;k++) {
            if (options[k]==tableData[i-1][this.schemaKeys[j]]) {
              selectedIndex = k;
            }
            let option = document.createElement("option");
            option.value = options[k];
            option.text = options[k];
            this.cellChildren[i][j].appendChild(option);
          } 
          this.cellChildren[i][j].selectedIndex = selectedIndex;
          console.log(this.cellChildren[i][j])
          
          this.cells[i][j].appendChild(this.cellChildren[i][j]);

        } else if (this.schemaDataTypes[j]=="User") {
          this.cellChildren[i].push(document.createElement("textarea"));
          this.cells[i][j].appendChild(this.cellChildren[i][j]);
          this.cellChildren[i][j].innerHTML = tableData[i-1][this.schemaKeys[j]];
          
        }
        
      }
      
    }


    
    
    
  }
}

window.onload=function(){
  data = {"Title2": "","Time Created": "Wed, 21 Sep 2022 03:45:37 GMT","Status":"Not started","Reporter":""}
  schema = {"Title2":{"type":"Text"},"Time Created":{"type":"Time"},"Status":{"type":"Multiple Choice","options":["Not started","Started","Complete"]},"Reporter":{"type":"User"}};
  let table1 = new table([data],schema)

}



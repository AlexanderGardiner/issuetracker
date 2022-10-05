class table {
  constructor(tableData, schema) {
    // Table data and schema both in format for a project but can be used for other tables

    // Initialize table and prepare variables
    this.table = document.createElement("table");
    document.body.appendChild(this.table);
    this.rows = [];
    this.cells = [];
    this.cellChildren = [];
    this.schemaKeys = Object.keys(schema);
    this.schemaDataTypes = [];
    for (let i = 0; i < this.schemaKeys.length; i++) {
      this.schemaDataTypes.push(schema[this.schemaKeys[i]].type);
    }

    // Create headers
    this.rows.push(this.table.insertRow(-1));
    this.cells.push([]);
    this.cellChildren.push([]);
    for (let i = 0; i < this.schemaKeys.length; i++) {
      this.cells[0].push(this.rows[0].insertCell(-1));
      this.cellChildren[0].push(document.createElement("h1"));
      this.cells[0][i].appendChild(this.cellChildren[0][i]);
      this.cellChildren[0][i].innerHTML = this.schemaKeys[i];
      this.cellChildren[0][i].classList.add("tableCellChild", "tableHeaderCellChild");
      this.cells[0][i].style.width = "1000px";
    }


    // Create body
    for (let i = 1; i < tableData.length + 1; i++) {
      this.addRow(tableData[i - 1], schema)
    }




  }
  // Adding rows 
  addRow(tableData, schema) {

    this.rows.push(this.table.insertRow(-1));
    this.cells.push([]);
    this.cellChildren.push([]);
    this.schemaDataTypes = [];
    for (let i = 0; i < this.schemaKeys.length; i++) {
      this.schemaDataTypes.push(schema[this.schemaKeys[i]].type);
    }
    let i = this.rows.length - 1;
    for (let j = 0; j < this.schemaDataTypes.length; j++) {
      this.cells[i].push(this.rows[i].insertCell(-1));
      if (this.schemaDataTypes[j] == "_id") {
        this.cellChildren[i].push(document.createElement("textarea"));
        this.cells[i][j].appendChild(this.cellChildren[i][j]);
        this.cellChildren[i][j].innerHTML = tableData[this.schemaKeys[j]];
        this.cellChildren[i][j].setAttribute("readonly", "true");
      } else if (this.schemaDataTypes[j] == "Text") {
        this.cellChildren[i].push(document.createElement("textarea"));
        this.cells[i][j].appendChild(this.cellChildren[i][j]);
        this.cellChildren[i][j].innerHTML = tableData[this.schemaKeys[j]];

      } else if (this.schemaDataTypes[j] == "ReadOnlyText") {
        this.cellChildren[i].push(document.createElement("textarea"));
        this.cells[i][j].appendChild(this.cellChildren[i][j]);
        this.cellChildren[i][j].setAttribute("readonly", "true");
        this.cellChildren[i][j].innerHTML = tableData[this.schemaKeys[j]].toString();

      } else if (this.schemaDataTypes[j] == "Time") {
        this.cellChildren[i].push(document.createElement("textarea"));
        this.cells[i][j].appendChild(this.cellChildren[i][j]);
        this.cellChildren[i][j].innerHTML = new Date(tableData[this.schemaKeys[j]]);
        this.cellChildren[i][j].setAttribute("readonly", "true");
      } else if (this.schemaDataTypes[j] == "Multiple Choice") {
        this.cellChildren[i].push(document.createElement("select"));
        let options = schema[this.schemaKeys[j]].options;
        let selectedIndex;
        for (let k = 0; k < options.length; k++) {
          if (options[k] == tableData[this.schemaKeys[j]]) {
            selectedIndex = k;
          }
          let option = document.createElement("option");
          option.value = options[k];
          option.text = options[k];
          this.cellChildren[i][j].appendChild(option);
        }
        this.cellChildren[i][j].selectedIndex = selectedIndex;

        this.cells[i][j].appendChild(this.cellChildren[i][j]);

      } else if (this.schemaDataTypes[j] == "Multiple Choice ReadOnly") {
        this.cellChildren[i].push(document.createElement("select"));
        let options = schema[this.schemaKeys[j]].options;
        let selectedIndex;
        for (let k = 0; k < options.length; k++) {
          if (options[k] == tableData[this.schemaKeys[j]]) {
            selectedIndex = k;
          }
          let option = document.createElement("option");
          option.value = options[k];
          option.text = options[k];
          this.cellChildren[i][j].appendChild(option);
        }
        this.cellChildren[i][j].selectedIndex = selectedIndex;
        this.cellChildren[i][j].disabled = true;

        this.cells[i][j].appendChild(this.cellChildren[i][j]);

      } else if (this.schemaDataTypes[j] == "User") {
        this.cellChildren[i].push(document.createElement("textarea"));
        this.cells[i][j].appendChild(this.cellChildren[i][j]);
        this.cellChildren[i][j].innerHTML = tableData[this.schemaKeys[j]];

      } else if (this.schemaDataTypes[j] == "File") {
        this.cellChildren[i].push(document.createElement("input"));
        this.cellChildren[i][j].type = "file";
        this.cells[i][j].appendChild(this.cellChildren[i][j]);

      }
      this.cellChildren[i][j].classList.add("tableCellChild");
      this.cells[i][j].style.width = "1000px";


    }


  }

  removeRow() {
    // Remove row
    if (this.cellChildren.length > 1 && this.cells.length > 1 && this.rows.length > 1) {
      for (let i = 0; i < this.cellChildren.length; i++) {
        this.cellChildren[this.cellChildren.length - 1][0].remove();
      }
      this.cellChildren.pop();
      for (let i = 0; i < this.cells.length; i++) {
        this.cells[this.cells.length - 1][0].remove();
      }



      this.cells.pop();
      this.rows[this.rows.length - 1].remove();
      this.rows.pop()
    }




  }

  exportTable(schema) {
    this.schemaKeys = Object.keys(schema);
    this.project = [];
    for (let i = 1; i < this.cellChildren.length; i++) {
      this.project.push({});
      for (let j = 0; j < this.cellChildren[i].length; j++) {
        if (this.schemaDataTypes[j]=="File") {
          if (this.cellChildren[i][j].files[0]!==undefined) {
            this.project[i - 1][this.schemaKeys[j]] = this.cellChildren[i][j].files[0].name;
          } else {
            this.project[i - 1][this.schemaKeys[j]] = "";
          }
          
        } else {
          this.project[i - 1][this.schemaKeys[j]] = this.cellChildren[i][j].value;
        }
        
        

      }
    }

    return this.project;
  }
}
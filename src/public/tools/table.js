class table {
  constructor(tableHeader, tableData) {
    // table data is a 1d arr of issues
    // table header is a list of text elements

    // Initialize table and prepare variables
    this.table = document.createElement("table");
    document.body.appendChild(this.table);
    this.rows = []; 
    this.cells = [];
    this.cellChildren = [];

    // Create headers
    this.rows.push(this.table.insertRow(-1));
    this.cells.push([]);
    this.cellChildren.push([]);
    for (let i=0; i<tableHeader.length;i++) {
      this.cells[0].push(this.rows[0].insertCell(-1));
      this.cellChildren[0].push(document.createElement("h1"));
      this.cells[0][i].appendChild(this.cellChildren[0][i]);
      this.cellChildren[0][i].innerHTML = tableHeader[i];
    }

    // Create body
    
    for (let i=1;i<tableData.length+1;i++) {
      this.tableDataTypes = Object.keys(tableData[i-1]);
      this.rows.push(this.table.insertRow(-1));
      this.cells.push([]);
      this.cellChildren.push([]);
      
      for (let j=0;j<this.tableDataTypes.length;j++) {
        this.cells[i].push(this.rows[i].insertCell(-1));
        
        if (this.tableDataTypes[j]=="text") {
          this.cellChildren[i].push(document.createElement("textarea"));
          this.cells[i][j].appendChild(this.cellChildren[i][j]);
          
          this.cellChildren[i][j].innerHTML = "test"//tableData[this.tableDataTypes[j]];
        }
        
      }
      
    }

    
    
    
  }
}

window.onload=function(){
  
  let table1 = new table(["test","test1"],[{"text":"test1"}])

}



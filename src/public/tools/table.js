class table {
  constructor(tableData, schema, headersEnabled) {
    console.log("Creating table");
    // Table data and schema both in format for a project but can be used for other tables

    // Initialize table and prepare variables
    this.table = document.createElement("table");
    document.body.appendChild(this.table);
    this.rows = [];
    this.cells = [];
    this.cellChildren = [];
    this.schemaKeys = Object.keys(schema);
    this.schemaDataTypes = [];
    this.schema = schema;
    this.tableHeader = this.table.createTHead();
    this.tableBody = this.table.createTBody();
    this.headersEnabled = headersEnabled;
    for (let i = 0; i < this.schemaKeys.length; i++) {
      this.schemaDataTypes.push(schema[this.schemaKeys[i]].type);
    }

    if (this.headersEnabled) {
      this.createHeaders();
    }

    // Create body
    for (let i = 0; i < tableData.length; i++) {
      this.addRow(tableData[i], schema, {});
    }
  }

  createHeaders() {
    // Create headers
    this.rows.push(this.tableHeader.insertRow(-1));
    this.cells.push([]);
    this.cellChildren.push([]);
    for (let i = 0; i < this.schemaKeys.length; i++) {
      this.cells[0].push(this.rows[0].insertCell(-1));
      this.cellChildren[0].push(document.createElement("div"));

      this.cells[0][i].appendChild(this.cellChildren[0][i]);

      this.cells[0][i].style.width = "1000px";
      this.cells[0][i].classList.add("tableHeaderCell");

      // Generate html based on type
      if (this.schemaDataTypes[i] == "_id") {
        this.cellChildren[0][i].appendChild(document.createElement("h1"));
        this.cellChildren[0][i].children[0].classList.add(
          "tableHeaderCellChild"
        );
        this.cellChildren[0][i].children[0].innerHTML =
          this.schemaKeys[i] + " =";

        this.cellChildren[0][i].appendChild(document.createElement("input"));
        this.cellChildren[0][i].children[1].type = "Text";
        this.cellChildren[0][i].children[1].classList.add(
          "tableHeaderCellChild"
        );

        this.cellChildren[0][i].appendChild(document.createElement("input"));
        this.cellChildren[0][i].children[2].type = "Checkbox";
      } else if (
        this.schemaDataTypes[i] == "Text" ||
        this.schemaDataTypes[i] == "ReadOnlyText"
      ) {
        this.cellChildren[0][i].appendChild(document.createElement("h1"));
        this.cellChildren[0][i].children[0].classList.add(
          "tableHeaderCellChild"
        );
        this.cellChildren[0][i].children[0].innerHTML =
          this.schemaKeys[i] + " =";

        this.cellChildren[0][i].appendChild(document.createElement("input"));
        this.cellChildren[0][i].children[1].type = "Text";
        this.cellChildren[0][i].children[1].classList.add(
          "tableHeaderCellChild"
        );

        this.cellChildren[0][i].appendChild(document.createElement("input"));
        this.cellChildren[0][i].children[2].type = "Checkbox";
      } else if (this.schemaDataTypes[i] == "Time") {
        this.cellChildren[0][i].appendChild(document.createElement("input"));
        this.cellChildren[0][i].children[0].type = "datetime-local";
        this.cellChildren[0][i].children[0].classList.add(
          "tableHeaderCellChild"
        );

        this.cellChildren[0][i].appendChild(document.createElement("h1"));
        this.cellChildren[0][i].children[1].classList.add(
          "tableHeaderCellChild"
        );
        this.cellChildren[0][i].children[1].innerHTML =
          "≤ " + this.schemaKeys[i] + " ≤";

        this.cellChildren[0][i].appendChild(document.createElement("input"));
        this.cellChildren[0][i].children[2].type = "datetime-local";
        this.cellChildren[0][i].children[2].classList.add(
          "tableHeaderCellChild"
        );
      } else if (
        this.schemaDataTypes[i] == "Multiple Choice" ||
        this.schemaDataTypes[i] == "Multiple Choice ReadOnly"
      ) {
        this.cellChildren[0][i].appendChild(document.createElement("h1"));
        this.cellChildren[0][i].children[0].classList.add(
          "tableHeaderCellChild"
        );
        this.cellChildren[0][i].children[0].innerHTML =
          this.schemaKeys[i] + " =";

        this.cellChildren[0][i].appendChild(document.createElement("Select"));
        let option = document.createElement("option");
        option.value = "";
        option.text = "";
        this.cellChildren[0][i].children[1].appendChild(option);
        for (
          let j = 0;
          j < this.schema[this.schemaKeys[i]].options.length;
          j++
        ) {
          let option = document.createElement("option");
          option.value = this.schema[this.schemaKeys[i]].options[j];
          option.text = this.schema[this.schemaKeys[i]].options[j];
          this.cellChildren[0][i].children[1].appendChild(option);
        }

        this.cellChildren[0][i].children[1].classList.add(
          "tableHeaderCellChild"
        );
      } else if (this.schemaDataTypes[i] == "User") {
        this.cellChildren[0][i].appendChild(document.createElement("h1"));
        this.cellChildren[0][i].children[0].classList.add(
          "tableHeaderCellChild"
        );
        this.cellChildren[0][i].children[0].innerHTML =
          this.schemaKeys[i] + " =";

        this.cellChildren[0][i].appendChild(document.createElement("input"));
        this.cellChildren[0][i].children[1].type = "Text";
        this.cellChildren[0][i].children[1].classList.add(
          "tableHeaderCellChild"
        );

        this.cellChildren[0][i].appendChild(document.createElement("input"));
        this.cellChildren[0][i].children[2].type = "Checkbox";
      } else if (this.schemaDataTypes[i] == "File") {
        this.cellChildren[0][i].appendChild(document.createElement("h1"));
        this.cellChildren[0][i].children[0].classList.add(
          "tableHeaderCellChild"
        );
        this.cellChildren[0][i].children[0].innerHTML =
          this.schemaKeys[i] + " =";

        this.cellChildren[0][i].appendChild(document.createElement("input"));
        this.cellChildren[0][i].children[1].type = "Text";
        this.cellChildren[0][i].children[1].classList.add(
          "tableHeaderCellChild"
        );

        this.cellChildren[0][i].appendChild(document.createElement("input"));
        this.cellChildren[0][i].children[2].type = "Checkbox";
      }
    }
  }

  datetimeLocal(datetime) {
    const dt = new Date(datetime);
    dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset());
    return dt.toISOString().slice(0, 16);
  }

  datetimeUTC(datetime) {
    const dt = new Date(datetime);
    dt.setMinutes(dt.getMinutes() + dt.getTimezoneOffset());
    return dt.toISOString().slice(0, 16);
  }

  // Add row
  addRow(tableData, schema, files) {
    console.log("Adding row");
    // Prepare vars and create rows
    this.tableData = tableData;
    this.rows.push(this.tableBody.insertRow(-1));
    this.cells.push([]);
    this.cellChildren.push([]);
    this.schemaDataTypes = [];
    for (let i = 0; i < this.schemaKeys.length; i++) {
      this.schemaDataTypes.push(schema[this.schemaKeys[i]].type);
    }

    let i = this.rows.length - 1;

    // Create cells based on type
    for (let j = 0; j < this.schemaDataTypes.length; j++) {
      this.cells[i].push(this.rows[i].insertCell(-1));

      if (this.schemaDataTypes[j] == "_id") {
        // Create id cell
        this.cellChildren[i].push(document.createElement("textarea"));
        this.cells[i][j].appendChild(this.cellChildren[i][j]);
        this.cellChildren[i][j].classList.add("textAreaCell");
        this.cellChildren[i][j].innerHTML = this.tableData[this.schemaKeys[j]];
        this.cellChildren[i][j].setAttribute("readonly", "true");

        this.cells[i][j].appendChild(document.createElement("button"));
        this.cells[i][j].children[1].innerHTML = "Delete";
        this.cells[i][j].children[1].setAttribute("issueIndex", i);
        let issueIndex = i;
        this.cells[i][j].children[1].onclick = function (issue) {
          removeIssue(this.parentElement.parentElement.rowIndex);
        };
      } else if (this.schemaDataTypes[j] == "Text") {
        // Create text cell
        this.cellChildren[i].push(document.createElement("textarea"));
        this.cells[i][j].appendChild(this.cellChildren[i][j]);
        if (this.tableData[this.schemaKeys[j]] != undefined) {
          this.cellChildren[i][j].innerHTML =
            this.tableData[this.schemaKeys[j]];
        }
        this.cellChildren[i][j].classList.add("textAreaCell");
      } else if (this.schemaDataTypes[j] == "ReadOnlyText") {
        // Create readonly text cell
        this.cellChildren[i].push(document.createElement("textarea"));
        this.cells[i][j].appendChild(this.cellChildren[i][j]);
        this.cellChildren[i][j].setAttribute("readonly", "true");
        this.cellChildren[i][j].classList.add("textAreaCell");
        if (this.tableData[this.schemaKeys[j]] != undefined) {
          this.cellChildren[i][j].innerHTML =
            this.tableData[this.schemaKeys[j]].toString();
        }
      } else if (this.schemaDataTypes[j] == "Time") {
        // Create time cell
        this.cellChildren[i].push(document.createElement("input"));
        this.cellChildren[i][j].type = "datetime-local";
        this.cells[i][j].appendChild(this.cellChildren[i][j]);
        this.cellChildren[i][j].value = this.datetimeLocal(
          this.tableData[this.schemaKeys[j]]
        );
        this.cellChildren[i][j].setAttribute("readonly", "true");
        this.cellChildren[i][j].classList.add("textAreaCell");
      } else if (this.schemaDataTypes[j] == "Multiple Choice") {
        // Create multiple choice cell
        this.cellChildren[i].push(document.createElement("select"));
        let options = schema[this.schemaKeys[j]].options;
        let selectedIndex;
        for (let k = 0; k < options.length; k++) {
          if (options[k] == this.tableData[this.schemaKeys[j]]) {
            selectedIndex = k;
          }
          let option = document.createElement("option");
          option.value = options[k];
          option.text = options[k];
          this.cellChildren[i][j].appendChild(option);
        }
        this.cellChildren[i][j].selectedIndex = selectedIndex;
        this.cellChildren[i][j].classList.add("selectCell");

        this.cells[i][j].appendChild(this.cellChildren[i][j]);
      } else if (this.schemaDataTypes[j] == "Multiple Choice ReadOnly") {
        // Create readonly multiple choice cell
        this.cellChildren[i].push(document.createElement("select"));
        let options = schema[this.schemaKeys[j]].options;
        let selectedIndex;
        for (let k = 0; k < options.length; k++) {
          if (options[k] == this.tableData[this.schemaKeys[j]]) {
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
        // Create user cell
        this.cellChildren[i].push(document.createElement("textarea"));
        this.cells[i][j].appendChild(this.cellChildren[i][j]);
        if (this.tableData[this.schemaKeys[j]] != undefined) {
          this.cellChildren[i][j].innerHTML =
            this.tableData[this.schemaKeys[j]];
        }
        this.cellChildren[i][j].classList.add("textAreaCell");
      } else if (this.schemaDataTypes[j] == "File") {
        // Create file cell
        this.cellChildren[i].push(document.createElement("div"));

        this.cellChildren[i][j].appendChild(document.createElement("img"));
        this.cellChildren[i][j].appendChild(document.createElement("div"));
        this.cellChildren[i][j].children[1].style.float = "right";
        this.cellChildren[i][j].children[1].style.left = "10px";
        this.cellChildren[i][j].children[1].style.position = "relative";
        this.cellChildren[i][j].children[1].appendChild(
          document.createElement("input")
        );
        this.cellChildren[i][j].children[1].appendChild(
          document.createElement("br")
        );
        this.cellChildren[i][j].children[1].appendChild(
          document.createElement("button")
        );

        let fileToRequest;
        let issueID;
        let propertyName;

        if (this.tableData[this.schemaKeys[j]] != undefined) {
          this.cellChildren[i][j].fileID =
            this.tableData[this.schemaKeys[j]].fileID;
          fileToRequest = this.tableData[this.schemaKeys[j]].fileName;
        } else {
          this.cellChildren[i][j].fileID = undefined;
        }

        // Get file
        if (fileToRequest) {
          let index = fileToRequest.indexOf(".");
          let filePath;
          if (index >= 0) {
            filePath = fileToRequest.substring(index, fileToRequest.length);
          }
          issueID = this.cellChildren[i][0].value;
          propertyName = this.schemaKeys[j];
          // Display file if image
          if (filePath == ".png" || filePath == ".jpg" || filePath == ".jpeg") {
            fetch("/getProjectFile", {
              method: "POST",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "access-control-allow-origin": "*",
              },
              body: JSON.stringify({
                projectName: projectName,
                fileName: fileToRequest,
                issueID: issueID,
                propertyName: propertyName,
              }),
            })
              .then((response) => response.blob())
              .then((data) => {
                // Create and style image
                let blob = new Blob([data]);
                let blobUrl = window.URL.createObjectURL(blob);
                this.cellChildren[i][j].children[0].setAttribute(
                  "src",
                  blobUrl
                );
                this.cellChildren[i][j].children[0].style.width = "auto";
                this.cellChildren[i][j].children[0].style.height = "auto";
                this.cellChildren[i][j].children[0].style.maxHeight = "100%";

                this.cellChildren[i][j].children[0].style.maxWidth = "100%";
                this.cellChildren[i][j].children[0].style["object-fit"] =
                  "contain";
              });
          }
        }

        // Set download link
        this.cellChildren[i][j].children[1].children[0].type = "file";

        this.cellChildren[i][j].children[1].children[2].onclick = function () {
          if (fileToRequest) {
            requestFile(fileToRequest, issueID, propertyName);
          }
        };
        if (this.tableData[this.schemaKeys[j]] != undefined) {
          this.cellChildren[i][j].children[1].children[2].innerHTML =
            "Download " + this.tableData[this.schemaKeys[j]].fileName;
          this.cellChildren[i][j].children[1].children[2].value =
            "Download " + this.tableData[this.schemaKeys[j]].fileName;
        } else {
          this.cellChildren[i][j].children[1].children[2].innerHTML =
            "Download ";
        }
        this.cells[i][j].appendChild(this.cellChildren[i][j]);

        let fileID = this.cellChildren[i][j].fileID;
        if (this.tableData[this.schemaKeys[j]] != undefined) {
          if (
            this.cellChildren[i][0].innerHTML != "Not In Database" &&
            this.tableData[this.schemaKeys[j]].fileName != "undefined" &&
            this.tableData[this.schemaKeys[j]].fileName != undefined
          ) {
            this.cellChildren[i][j].children[1].children[0].onchange =
              function () {
                prepareDeletionOfOldFile(fileID);
              };
          }
        }
      }

      this.cellChildren[i][j].classList.add("tableCellChild");
      this.cells[i][j].classList.add("tableCell");
    }
    let filesKeys = Object.keys(files);
    for (let k = 0; k < filesKeys.length; k++) {
      this.cellChildren[i][filesKeys[k]].children[1].children[0].files =
        files[filesKeys[k]].files;
    }
  }

  // Get the filters from the table
  getFilters() {
    let filters = {};

    for (let i = 0; i < this.cellChildren[0].length; i++) {
      if (this.schemaDataTypes[i] == "_id") {
        if (this.cellChildren[0][i].children[2].checked) {
          filters[this.schemaKeys[i]] =
            this.cellChildren[0][i].children[1].value;
        }
      } else if (
        this.schemaDataTypes[i] == "Text" ||
        this.schemaDataTypes[i] == "ReadOnlyText"
      ) {
        if (this.cellChildren[0][i].children[2].checked) {
          filters[this.schemaKeys[i]] =
            this.cellChildren[0][i].children[1].value;
        }
      } else if (this.schemaDataTypes[i] == "Time") {
        filters[this.schemaKeys[i]] = {};

        filters[this.schemaKeys[i]].startTime =
          this.cellChildren[0][i].children[0].valueAsDate;

        filters[this.schemaKeys[i]].endTime =
          this.cellChildren[0][i].children[2].valueAsDate;
      } else if (
        this.schemaDataTypes[i] == "Multiple Choice" ||
        this.schemaDataTypes[i] == "Multiple Choice ReadOnly"
      ) {
        if (!(this.cellChildren[0][i].children[1].value == "")) {
          filters[this.schemaKeys[i]] =
            this.cellChildren[0][i].children[1].value;
        }
      } else if (this.schemaDataTypes[i] == "User") {
        if (this.cellChildren[0][i].children[2].checked) {
          filters[this.schemaKeys[i]] =
            this.cellChildren[0][i].children[1].value;
        }
      } else if (this.schemaDataTypes[i] == "File") {
        if (this.cellChildren[0][i].children[2].checked) {
          filters[this.schemaKeys[i]] =
            this.cellChildren[0][i].children[1].value;
        }
      }
    }

    return filters;
  }

  // Remove row
  removeRow(issue) {
    if (issue == undefined) {
      issue = this.rows.length - 1;
    }
    console.log("Removing row");
    this.cellChildren.splice(parseInt(issue), 1);
    this.cells.splice(parseInt(issue), 1);
    this.rows[parseInt(issue)].remove();
    this.rows.splice(parseInt(issue), 1);
  }

  // Export table data
  exportTable(schema) {
    console.log("Exporting table");
    this.schemaKeys = Object.keys(schema);
    this.project = [];
    this.files = [];
    this.fileNames = [];
    this.fileIDs = [];

    if (this.headersEnabled) {
      for (let i = 1; i < this.cellChildren.length; i++) {
        this.project.push({});
        for (let j = 0; j < this.cellChildren[i].length; j++) {
          if (this.schemaDataTypes[j] == "File") {
            // Special formatting for file
            if (
              this.cellChildren[i][j].children[1].children[0].files[0] !==
              undefined
            ) {
              this.project[i - 1][this.schemaKeys[j]] =
                this.cellChildren[i][j].children[1].children[0].files[0].name;
              this.files.push(
                this.cellChildren[i][j].children[1].children[0].files[0]
              );
              this.fileNames.push(
                this.cellChildren[i][j].children[1].children[0].files[0].name
              );
              this.fileIDs.push(this.cellChildren[i][j].fileID);
            } else {
              this.project[i - 1][this.schemaKeys[j]] = "";
            }
          } else if (this.schemaDataTypes[j] == "Time") {
            this.project[i - 1][this.schemaKeys[j]] = this.datetimeUTC(
              this.cellChildren[i][j].valueAsDate
            );
          } else {
            // Everything else
            this.project[i - 1][this.schemaKeys[j]] =
              this.cellChildren[i][j].value;
          }
        }
      }
    } else {
      for (let i = 0; i < this.cellChildren.length; i++) {
        this.project.push({});
        for (let j = 0; j < this.cellChildren[i].length; j++) {
          if (this.schemaDataTypes[j] == "File") {
            // Special formatting for file
            if (
              this.cellChildren[i][j].children[1].children[0].files[0] !==
              undefined
            ) {
              this.project[i][this.schemaKeys[j]] =
                this.cellChildren[i][j].children[1].children[0].files[0].name;
              this.files.push(
                this.cellChildren[i][j].children[1].children[0].files[0]
              );
              this.fileNames.push(
                this.cellChildren[i][j].children[1].children[0].files[0].name
              );
              this.fileIDs.push(this.cellChildren[i][j].fileID);
            } else {
              this.project[i][this.schemaKeys[j]] = "";
            }
          } else if (this.schemaDataTypes[j] == "Time") {
            this.project[i][this.schemaKeys[j]] = this.datetimeUTC(
              this.cellChildren[i][j].valueAsDate
            );
          } else {
            // Everything else
            this.project[i][this.schemaKeys[j]] = this.cellChildren[i][j].value;
          }
        }
      }
    }

    return this.project;
  }
}

let userTable;
let schema;
// Get users from server and send to be displayed
fetch("/getUsers", {
  method: 'POST',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'access-control-allow-origin': '*'
  }
})
  .then(response => response.json())
  .then(data => displayUsers(data));

function displayUsers(data) {
  let users = data.Users;
  tableData = [];
  schema = {
    "Username": {
      "type": "Text"
    },
    "User Type": {
      "type": "Multiple Choice",
      "options": ["User", "Admin"]
    },
    "Change Password": {
      "type": "Text"
    }
  };

  console.log(users)

  for (let i = 0; i < users.length; i++) {
    tableData.push({ "Username": users[i].username, "User Type": users[i].userType, "Change Password": "" })
  }


  userTable = new table(tableData, schema, true);
}

function filterUsers() {
  let filters = userTable.getFilters();
  userTable.table.remove();
  
  fetch("/getUsers", {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'access-control-allow-origin': '*'
    },
    body: JSON.stringify({
      "filters": filters
    })
  })
  .then(response => response.json())
  .then(data => displayUsers(data));
  console.log(filters);
}

function updateUsers() {
  let userData = userTable.exportTable(schema);
  console.log(userData);
}
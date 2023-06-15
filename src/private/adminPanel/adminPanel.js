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
    "Old Username": {
      "type": "ReadOnlyText"
    },
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
    tableData.push({"Old Username":users[i].username, "Username": users[i].username, "User Type": users[i].userType, "Change Password": "" })
  }


  userTable = new table(tableData, schema, true);
}

// Go to main page
function mainPage() {
  console.log("Redirecing to main page");
  window.location.href = "../";
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

  let formattedUserData = [];
  for (let i=0; i<userData.length;i++) {
    formattedUserData.push({});
    formattedUserData[i].oldUsername = userData[i]["Old Username"];
    formattedUserData[i].username = userData[i].Username;
    formattedUserData[i].userType = userData[i]["User Type"];
    if (userData[i]["Change Password"]!="") {
      formattedUserData[i].password = userData[i]["Change Password"];
    }
    
  }
  console.log(formattedUserData);
  let bodyData = {
    users: formattedUserData
  };
  console.log(JSON.stringify(bodyData));
  fetch("/updateUsers", {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'access-control-allow-origin': '*'
    },
    body: JSON.stringify(bodyData),
  })
  
}
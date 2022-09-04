fetch("/getProjectNames", {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'access-control-allow-origin': '*'
    },
    body: JSON.stringify({ "query": "requestlevel"})
  })
    .then(response => response.json())
    .then(data => console.log(data));
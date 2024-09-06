chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "sendImageUrl",
    title: "Confy It",
    contexts: ["image"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "sendImageUrl") {
    const imageUrl = info.srcUrl;

    // Replace with the actual ConfyUI API endpoint
    const url = "http://localhost:8188/prompt"; 

    // Define the JSON payload for the ConfyUI API
    const workflowData = {
      "workflow": {
        "steps": [
          {
            "name": "uploadImage",
            "type": "apiCall",
            "endpoint": "https://confyui.com/api/upload",  // Example endpoint
            "method": "POST",
            "params": {
              "url": imageUrl  // Pass the image URL as a parameter
            }
          }
        ]
      }
    };

    fetch(url, {  
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(workflowData)
    })
    .then(response => response.json())
    .then(data => console.log('Success:', data))
    .catch((error) => console.error('Error:', error));
  }
});

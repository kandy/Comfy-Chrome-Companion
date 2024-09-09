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

    chrome.storage.local.get(['clientId', 'workflow'], (items) => {
      const clientId = items.clientId;
      const workflowData = items.workflow ? JSON.parse(items.workflow) : {};

      // Define the JSON payload for the ConfyUI API
      let workflow = workflowData;
      let index = Object.values(workflow).findIndex((el) => el.class_type == "Load Image From Url (mtb)");
      if (index === -1) {
        tab.alert("Cannot fine URL in workflow"); 
        return;
      }
      let key = Object.keys(workflow)[index];
      workflow[key].inputs = {url: imageUrl};
      
      fetch(url, {  
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify( {"prompt": workflow, "client_id": clientId})
      })
      .then(response => response.json())
      .then(data => console.log('Success:', data))
      .catch((error) => console.error('Error:', error));
    });
  };
});

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

    chrome.storage.sync.get(['clientId', 'workflow'], (items) => {
      const clientId = items.clientId;
      const workflowData = items.workflow ? JSON.parse(items.workflow) : {};

      // Define the JSON payload for the ConfyUI API
      let workflow = workflowData;
      //index = workflow.find((el) => el.type == "Load Image From Url (mtb)");
      workflow["143"].inputs = {"url": imageUrl};

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

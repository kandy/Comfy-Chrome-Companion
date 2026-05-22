function ensureContextMenu() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'sendImageUrl',
      title: 'Confy It',
      contexts: ['image']
    });
  });
}

const TEMPLATE_PLACEHOLDERS = {
  imageUrl: '{{image_url}}',
  imageData: '{{image}}'
};

async function fetchImageAsBase64(imageUrl) {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
  }
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result;
      const base64 = typeof dataUrl === 'string'
        ? dataUrl.replace(/^data:[^;]+;base64,/, '')
        : null;
      if (!base64) {
        reject(new Error('Failed to extract base64 data from image')); 
        return;
      }
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Failed to convert image to base64'));
    reader.readAsDataURL(blob);
  });
}

function buildWorkflowPayload(workflowString, imageUrl, imageData) {
  if (!workflowString) {
    return {
      image_url: imageUrl,
      image_data: imageData
    };
  }

  const replaced = workflowString
    .replaceAll(TEMPLATE_PLACEHOLDERS.imageUrl, imageUrl)
    .replaceAll(TEMPLATE_PLACEHOLDERS.imageData, imageData || imageUrl);

  try {
    return JSON.parse(replaced);
  } catch (error) {
    throw new Error(`Workflow JSON is invalid: ${error.message}`);
  }
}

// Helper function to process and send image to ComfyUI
async function processImageForComfy(imageUrl) {
  const items = await chrome.storage.local.get(['clientId', 'comfyUrl', 'workflow']);
  const clientId = items.clientId;
  const comfyUrl = items.comfyUrl;
  const workflowTemplate = items.workflow || '';

  if (!clientId) {
    console.warn('Missing clientId in extension settings. Please configure it in options.');
    throw new Error('Missing clientId');
  }

  if (!comfyUrl) {
    console.warn('Missing ComfyUI URL in extension settings. Please configure it in options.');
    throw new Error('Missing ComfyUI URL');
  }

  let imageData;
  try {
    imageData = await fetchImageAsBase64(imageUrl);
  } catch (error) {
    console.warn('Unable to convert image to Base64, falling back to image URL.', error);
  }

  let promptPayload;
  try {
    promptPayload = buildWorkflowPayload(workflowTemplate, imageUrl, imageData);
  } catch (error) {
    console.error(error.message);
    throw error;
  }

  const requestBody = {
    prompt: promptPayload,
    client_id: clientId
  };
  console.log('Sending request to ComfyUI with payload:', requestBody);
  try {
    const response = await fetch(comfyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${comfyUrl}: ${response.status} ${requestBody}`);
    }

    console.log('ConfyUI request sent successfully.');
  } catch (error) {
    console.error('Failed to send request to ConfyUI endpoint:', error);
    throw error;
  }
}

chrome.runtime.onInstalled.addListener(ensureContextMenu);
chrome.runtime.onStartup.addListener(ensureContextMenu);
ensureContextMenu();

// Listen for messages from content script (Alt+Double Click)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'KAndy::processImage') {
    const imageUrl = message.imageUrl;
    if (!imageUrl) {
      return;
    }

    processImageForComfy(imageUrl)
    
    return true; // Will respond asynchronously
  }
});

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId !== 'sendImageUrl') return;

  const imageUrl = info.srcUrl;
  if (!imageUrl) {
    console.warn('Context menu item clicked without srcUrl.');
    return;
  }

  processImageForComfy(imageUrl).catch((error) => {
    console.error('Error processing image:', error);
  });
});

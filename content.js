// Listen for clicks on images while Win (Meta) + Alt keys are pressed
document.addEventListener('click', (event) => {
  if (!event.altKey) return;

  const target = event.target;
  if (target.closest && !(el = target.closest('img'))) return;

  event.preventDefault();
  event.stopPropagation();

  const imageUrl = el.src;
  if (!imageUrl) {
    console.warn('Image element has no src attribute');
    return;
  }
  target.style.outline = '8px solid #0c0'; // Visual feedback for selection

  // Send message to background script to process the image
  chrome.runtime.sendMessage(
    {
      type: 'processImage',
      imageUrl: imageUrl
    },
    (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error sending message:', chrome.runtime.lastError);
      } else if (response?.success) {
        console.log('Image sent to ComfyUI successfully');
      } else if (response?.error) {
        console.error('Error processing image:', response.error);
      }
    }
  );
}, true); // Use capture phase to ensure we catch the event

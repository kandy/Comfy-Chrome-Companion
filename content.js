// Listen for clicks on images while  Alt keys are pressed
document.addEventListener('click', (event) => {
  if (!event.altKey) return;
console.log(event);
  let target = event.target;
  if (!target.matches('img')) {
    target = target.closest('img');
    if (!target || !target.matches('img')) return;
  }

  event.preventDefault();
  event.stopPropagation();

  const imageUrl = target.src;
  if (!imageUrl) {
    console.warn('Image element has no src attribute');
    return;
  }
  

  // Send message to background script to process the image (fire-and-forget)
  chrome.runtime.sendMessage({
    type: 'KAndy::processImage',
    imageUrl: imageUrl
  }).catch(() => {
    // Silently handle if service worker is unavailable
    target.style.outline = '8px solid #c00'; // Visual feedback for selection
  });
  target.style.outline = '8px solid #0c0'; // Visual feedback for selection
}, true); // Use capture phase to ensure we catch the event

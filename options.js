document.addEventListener('DOMContentLoaded', () => {
    // Load the saved options
    chrome.storage.sync.get(['clientId', 'workflow'], (items) => {
        document.getElementById('clientId').value = items.clientId || '';
        document.getElementById('workflow').value = items.workflow || '';
    });

    // Save the options when the button is clicked
    document.getElementById('save').addEventListener('click', () => {
        const clientId = document.getElementById('clientId').value;
        const workflow = document.getElementById('workflow').value;

        chrome.storage.sync.set({ clientId, workflow }, () => {
            alert('Configuration saved!');
        });
    });
});
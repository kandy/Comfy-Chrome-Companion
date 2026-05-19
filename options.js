document.addEventListener('DOMContentLoaded', () => {
    const clientIdInput = document.getElementById('clientId');
    const comfyUrlInput = document.getElementById('comfyUrl');
    const workflowInput = document.getElementById('workflow');
    const statusLabel = document.getElementById('status');

    const setStatus = (message, isError = false) => {
        statusLabel.textContent = message;
        statusLabel.style.color = isError ? '#c00' : '#080';
        setTimeout(() => { statusLabel.textContent = ''; }, 3000);
    };

    chrome.storage.local.get(['clientId', 'comfyUrl', 'workflow'], (items) => {
        clientIdInput.value = items.clientId || '';
        comfyUrlInput.value = items.comfyUrl || '';
        workflowInput.value = items.workflow || '';
    });

    document.getElementById('save').addEventListener('click', () => {
        const clientId = clientIdInput.value.trim();
        const comfyUrl = comfyUrlInput.value.trim();
        const workflow = workflowInput.value.trim();

        if (!clientId) {
            setStatus('Client ID is required.', true);
            return;
        }

        if (!comfyUrl) {
            setStatus('ComfyUI URL is required.', true);
            return;
        }

        try {
            new URL(comfyUrl);
        } catch (error) {
            setStatus('ComfyUI URL is invalid.', true);
            return;
        }

        if (workflow) {
            try {
                JSON.parse(workflow);
            } catch (error) {
                setStatus('Workflow JSON is invalid.', true);
                return;
            }
        }

        chrome.storage.local.set({ clientId, comfyUrl, workflow }, () => {
            setStatus('Configuration saved successfully.');
        });
    });
});
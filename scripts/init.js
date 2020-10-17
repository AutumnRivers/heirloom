// temp
setTimeout(() => {
    const { ipcRenderer } = require('electron');
    ipcRenderer.send('open-main-window');
}, 5000);
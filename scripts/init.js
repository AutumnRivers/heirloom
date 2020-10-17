// temp
// This file will detect the Legendary installation
// Right now... not doing much else.
setTimeout(() => {
    const { ipcRenderer } = require('electron');
    ipcRenderer.send('open-main-window');
}, 2000);
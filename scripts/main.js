var M = require('materialize-css');
const epicGamesStatus = require('epicgames-status');
var fs = require('fs');
const { ipcRenderer, remote } = require('electron');

M.AutoInit();

epicGamesStatus().then(status => {
    var egStatus = status;
    document.getElementById('egStatus').innerHTML = egStatus.EpicGamesStore;
});

window.addEventListener('load', () => {
    document.title = 'Heirloom v' + (JSON.parse(fs.readFileSync('./package.json')).version);
});

ipcRenderer.on('legendary-term-data', (ev, data) => {
    console.info('Data Received: ' + data);
});
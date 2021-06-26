const { ipcRenderer } = require('electron');
const shell = require('child_process');
const unix = require('shelljs');

if(unix.which('legendary')) {
    const { ipcRenderer } = require('electron');
    ipcRenderer.send('open-main-window');
} else {
    ipcRenderer.send('legendary-install-not-found');
}

ipcRenderer.once('install-legendary', installLegendary);

function installLegendary() {
    const https = require('https');
    const fs = require('fs');

    fs.open('./legendary/legendary.exe', () => { return; });

    const legendaryDLLocation = 'https://github.com/derrod/legendary/releases/download/0.20.1/legendary.exe';

    const legendaryExec = fs.createWriteStream('./legendary/legendary.exe');

    https.get(legendaryDLLocation, response => {

        https.get(response.headers['location'], res => {
            const legendarySize = res.headers['content-length'];
            res.pipe(legendaryExec);

            var totalDataWritten = 0;

            document.getElementById('progress').style.display = 'block';

            res.on('data', chunk => {
                totalDataWritten += chunk.length;

                var percentDownloaded = (totalDataWritten / legendarySize) * 100;

                document.getElementById('percentDownload').innerHTML = +percentDownloaded.toFixed(2);

                if(totalDataWritten == legendarySize) {
                    ipcRenderer.send('open-main-window');
                }
            });
        });
    });
}
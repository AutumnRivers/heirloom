const { ipcRenderer, remote } = require('electron');
const unix = require('shelljs');
const fs = require('fs');
const latestSupportedLegendary = '0.20.6'

if(unix.which('legendary') || fs.existsSync('./legendary/legendary.exe')) {
    ipcRenderer.send('get-legendary-version');

    ipcRenderer.on('legendary-version', (ev, version) => {
        version = version.split('legendary version ')[1];
        version = version.split(',')[0];
        version = version.split('"')[1];
        if(version !== latestSupportedLegendary) {
            const notifySound = new Audio('../audio/notify.wav');
            notifySound.play();
            const legendaryDialog = remote.dialog.showMessageBoxSync(remote.getCurrentWindow(), {
                type: 'error',
                buttons: ['Update Legendary', 'Close Heirloom', 'Continue With Unsupported Version'],
                defaultId: 0,
                title: 'Legendary Outdated',
                message: `You are using an unsupported version of Legendary.\n\nThe latest supported release of Legendary is ${latestSupportedLegendary}, you are using ${version}.\n\nIf you're using an existing install of Legendary with PATH, you'll have to update Legendary yourself. If you're using the Heirloom install of Legendary, then you may update Legendary from here.`,
                icon: './images/HeirloomError.ico',
                cancelId: 2
            });

            if(legendaryDialog === 0) {
                installLegendary();
            } else if(legendaryDialog === 1) {
                remote.app.quit();
            } else {
                alert("Continuing with an unsupported version of Legendary. !!THINGS WILL BREAK!!")
                ipcRenderer.send('open-main-window');
            }
        } else {
            console.log('Legendary is up-to-date')
            ipcRenderer.send('open-main-window');
        }
    })
} else {
    ipcRenderer.send('legendary-install-not-found');
}

ipcRenderer.once('install-legendary', installLegendary);

function installLegendary() {
    const https = require('https');
    const fs = require('fs');

    fs.open('./legendary/legendary.exe', () => { return; });

    const legendaryDLLocation = 'https://github.com/derrod/legendary/releases/download/0.20.6/legendary.exe';

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
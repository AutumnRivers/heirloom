var M = require('materialize-css');
const epicGamesStatus = require('epicgames-status');
var fs = require('fs');
const { ipcRenderer, remote } = require('electron');
const { TextEncoder } = require('util');
const shell = require('shelljs');

var gameModalElem;

M.AutoInit();

epicGamesStatus().then(status => {
    var egStatus = status;
    document.getElementById('egStatus').innerHTML = egStatus.EpicGamesStore;
});

window.addEventListener('load', () => {
    document.title = 'Heirloom - Retrieving Data...';

    window.gameModalElem = M.Modal.getInstance(document.getElementById('gameModal'));

    if(shell.which('legendary')) {
        document.getElementById('legendaryStatus').innerHTML = 'Installed';
        getUserInfo();
        checkGames();
    } else {
        document.getElementById('legendaryStatus').innerHTML = 'Not Installed';
        document.title = 'Heirloom - Legendary Not Detected!';
    }
});

// //

function openGameModal(elem, gameArt, serverVer, installPath, localVer) {

    gameModalElem.open();

    if(gameArt) {
        document.getElementById('gameArt').src = gameArt.url;
    } else {
        document.getElementById('gameArt').src = '../images/gameArtPlaceholder.png';
    }

    document.getElementById('gameModalTitle').innerHTML = elem.children[0].innerHTML;

    document.getElementById('serverVersion').innerHTML = serverVer;
    
    if(installPath) {
        document.getElementById('localVersion').innerHTML = localVer;
        
        document.getElementById('gameLocation').innerHTML = installPath;
    } else {
        document.getElementById('localVersion').innerHTML = 'n/a';
        
        document.getElementById('gameLocation').innerHTML = 'n/a';
    }

}

// //

ipcRenderer.on('legendary-term-data', (ev, data) => {
    console.info(data);
});

ipcRenderer.on('legendary-error-data', (ev,err) => {
    console.error(err);
});

// //

function getUserInfo() {
    ipcRenderer.send('use-legendary', 'getinfo');

    ipcRenderer.on('legendary-term-data', parseUserInfo)

    function parseUserInfo(ev, data) {
        if(data.startsWith('{')) {
            let userInfo = JSON.parse(data);

            document.getElementById('installedGamesNo').innerHTML = userInfo.games_installed;
            document.getElementById('ownedGamesNo').innerHTML = userInfo.games_available;
            document.getElementById('accountStatus').innerHTML = `You are logged in as ${userInfo.account}`;

            ipcRenderer.removeListener('legendary-term-data', parseUserInfo);
        }
    }
}

function checkGames() {
    ipcRenderer.send('use-legendary', 'ownedgames');

    ipcRenderer.on('legendary-term-data', setGamesList);

    function setGamesList(ev, list) {

        if(list.startsWith('[\r')) {
            ipcRenderer.send('use-legendary', 'listgames');

            ipcRenderer.on('legendary-term-data', getInstalledGamesAndSetTable);

            ipcRenderer.removeListener('legendary-term-data', setGamesList);

            function getInstalledGamesAndSetTable(event, installList) {

                if(!installList.startsWith('[\r')) return;

                let installedList = JSON.parse(installList);

                let gamesList = JSON.parse(list);
                let gamesTable = document.getElementById('gamesTable').getElementsByTagName('tbody')[0];

                gamesList.forEach(game => {
                    var newGame = gamesTable.insertRow();
                    newGame.setAttribute('data-appname', game.app_name);

                    var thisGame = installedList.filter(installedGame => {
                        return installedGame.title == game.app_title
                    });

                    for(var currentCell = 0; currentCell < 3; currentCell++) {
                        var newCell = newGame.insertCell(currentCell);
                        var cellBody = '...';
                        
                        switch(currentCell) {
                            case 0:
                                cellBody = game.app_title;
                                break;
                            case 1:
                                cellBody = game.app_version;
                                break;
                            case 2:
                                if(thisGame[0]) {
                                    cellBody = 'Installed';
                                } else {
                                    cellBody = 'Not Installed';
                                }
                                break;
                            default:
                                break;
                        }

                        newCell.appendChild(document.createTextNode(cellBody));
                    }

                    newGame.addEventListener('click',  () => {
                        openGameModal(newGame, game.metadata.keyImages.find(meta => meta.type === 'DieselGameBoxTall'), game.app_version, thisGame[0] ? thisGame[0].install_path : false, thisGame[0] ? thisGame[0].version : false)
                    });
                });

                document.title = 'Heirloom v' + (JSON.parse(fs.readFileSync('./package.json')).version);

                ipcRenderer.removeListener('legendary-term-data', getInstalledGamesAndSetTable);

            }
        }
    }
}
// Entry point file
const { app, BrowserWindow, ipcMain, Menu } = require('electron');

const Store = require('electron-store');
const fetch = require('node-fetch');
const unixShell = require('shelljs');
const chalk = require('chalk'); // Chalk is used to color the command line, make it look pretty.
const fs = require('fs');
const childProcess = require('child_process');

const cliArgs = process.argv.slice(2);
const appStorage = new Store();

function startup() {

    console.log('Starting application...');

    // Detect installation of Legendary
    // This is mainly for debug purposes
    // The only detection that matters is when the app actually starts
    if(!unixShell.which('legendary')) {

        console.log(chalk.red('Legendary installation not detected.'));

    } else {

        console.log(chalk.green('Legendary is installed.'));

    }

    let initWindow = new BrowserWindow({
        width: 320,
        height: 240,
        webPreferences: {
            nodeIntegration: true,
            webviewTag: false,
            enableRemoteModule: true
        },
        frame: false,
        icon: './images/HeirloomIcon.ico'
    });

    initWindow.loadFile('./pages/initScreen.html');

    console.log('\033[2J');

    console.log(`Welcome to Heirloom v${JSON.parse(fs.readFileSync('./package.json')).version}!\nAll output will be logged here.\n-----\n`);

    ipcMain.once('open-main-window', () => {
        openMainWindow();
        initWindow.close();
    });

}

function openMainWindow() {

    console.log('Main window loading...\n\n');

    let mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        webPreferences: {
            nodeIntegration: true,
            webviewTag: false,
            enableRemoteModule: true
        },
        frame: true,
        icon: './images/HeirloomIcon.ico'
    });

    var menuBar = Menu.buildFromTemplate([
        {
            label: "Heirloom",
            submenu: [
                {
                    label: "Settings",
                    click() {
                        mainWindow.webContents.send('navigate-to-settings');
                    }
                },
                process.env.NODE_ENV === 'dev' ? {"label": "Inspect", click() { mainWindow.webContents.openDevTools(); }} : {"type":"separator"},
                {
                    label: "Send Test Signal (Dev)",
                    click() {
                        spawnLegendaryConsole('status', ['--offline']);
                    },
                    visible: process.env.NODE_ENV === 'dev'
                },
                {
                    label: "Quit",
                    click() {
                        app.quit();
                    }
                }
            ]
        }
    ]);

    Menu.setApplicationMenu(menuBar);

    mainWindow.loadFile('./pages/hub.html');

    mainWindow.webContents.on('use-legendary', (ev, cmd, args) => {

        if(!unixShell.which('legendary')) return mainWindow.webContents.send('legendary-not-installed');

        switch(cmd) {
            case 'auth': // Authentication
                break;
            case 'unauth': // Logging out
                break;
            case 'switchuser': // Switches to specified user. Arguments required.
                if(!args || args.length === 0) return mainWindow.webContents.send('args-required');
                break;
            case 'listgames': // List installed games
                break;
            case 'ownedgames': // List owned games
                break;
            case 'launchgame': // Launch installed game. Arguments required.
                if(!args || args.length === 0) return mainWindow.webContents.send('args-required');
                break;
            case 'getinfo': // Get general information
                break;
            case 'verifyfiles': // Verify files of a game. Arguments required.
                if(!args || args.length === 0) return mainWindow.webContents.send('args-required');
                break;
            case 'installgame': // Install a game. Arguments required.
                if(!args || args.length === 0) return mainWindow.webContents.send('args-required');
                break;
            case 'testinstall': // Test installation of Legendary. Meant for debugging.
                spawnLegendaryConsole('status', ['--offline']);
                break;
            default: // Failsafe
                console.warn(chalk.yellow('Invalid Legendary Command'));
                return mainWindow.webContents.send('invalid-command');
        }

    });

    function spawnLegendaryConsole(command, args) {
        // TODO: Use a package to actually spawn a window with this if enabled
        // --enable-terminal / -t
        var legendaryTerminal = childProcess.exec(`legendary ${command} ${args}`);
        // FIXME: args will be coming in arrays, not strings. Separate those so they're multiple.
        // Ok me I will do that
        // Thank you me :)
    
        legendaryTerminal.stdout.on('data', (data) => {
            mainWindow.webContents.send('legendary-term-data', data);
        });
    
        legendaryTerminal.stderr.on('data', (errorData) => {
            mainWindow.webContents.send('legendary-error-data', errorData);
            console.error(chalk.red('Legendary encountered an error: ' + errorData));
        });

        legendaryTerminal.on('close', () => {
            return mainWindow.webContents.send('finished-terminal-process');
        });
    }

}

app.on('ready', startup);
// Entry point file
const { app, BrowserWindow, ipcMain, Menu, shell, dialog } = require('electron');

const Store = require('electron-store');
const fetch = require('node-fetch');
const unixShell = require('shelljs');
const chalk = require('chalk'); // Chalk is used to color the command line, make it look pretty.
const fs = require('fs');
const childProcess = require('child_process');
const main = require('epicgames-status');

const cliArgs = process.argv.slice(2);
const appStorage = new Store({
    defaults: {
        'prefs.install_location': 'C:\\legendary\\',
        'epicAuth': undefined
    }
});

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

    console.log(`Welcome to Heirloom v${app.getVersion()}!\nAll output will be logged here.\n-----\n`);

    ipcMain.once('open-main-window', () => {
        openMainWindow();
        initWindow.close();
    });

    ipcMain.once('legendary-install-not-found', () => {
        const legendaryDialog = dialog.showMessageBoxSync(initWindow, {
            type: 'error',
            buttons: ['Install Legendary', 'Close Heirloom'],
            defaultId: 0,
            title: 'Legendary Not Installed',
            message: 'It appears Legendary is not installed on your system. This is required to run Heirloom. If you\'d like, Heirloom can install it for you!\n\nIf you still don\'t want Heirloom to do so, then you must close the application and add Legendary to your PATH. Check the repo for more information.\n\nhttps://www.github.com/AutumnRivers/Heirloom',
            icon: './images/HeirloomError.ico',
            cancelId: 1
        });
    
        if(legendaryDialog === 0) {
            console.log('Installing Legendary.');
            initWindow.webContents.send('install-legendary');
        } else {
            console.log('Installation Aborted.');
            app.quit();
        }
    });

    ipcMain.once('get-legendary-version', () => {
        var legendaryCmd = __dirname + '\\legendary\\legendary.exe'
        if(unixShell.which('legendary')) legendaryCmd = 'legendary'

        console.log(legendaryCmd)

        var legendaryTerminal = childProcess.exec(`"${legendaryCmd}" --version`);

        legendaryTerminal.stdout.on('data', (version) => {
            initWindow.webContents.send('legendary-version', version);
        })
    })

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

    global.heirloomWindow = mainWindow;

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
                process.env.HEIRLOOM_ENV === 'dev' ? {"label": "Inspect", click() { mainWindow.webContents.openDevTools(); }} : {"type":"separator"},
                {
                    label: "Send Test Signal (Dev)",
                    click() {
                        spawnLegendaryConsole('status', ['--offline', '--json']);
                    },
                    visible: process.env.NODE_ENV === 'dev'
                },
                {
                    label: "Force Refresh",
                    click() {
                        mainWindow.webContents.send('force-check');
                    }
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

    ipcMain.on('use-legendary', (ev, cmd, args) => {

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
                spawnLegendaryConsole('list-installed', ['--json']);
                break;
            case 'ownedgames': // List owned games
                spawnLegendaryConsole('list-games', ['--json']);
                break;
            case 'launchgame': // Launch installed game. Arguments required.
                if(!args || args.length === 0) return mainWindow.webContents.send('args-required');
                spawnLegendaryConsole('launch', [args[0], args[1] == true ? '--offline' : '']);
                break;
            case 'getinfo': // Get general information
                spawnLegendaryConsole('status', ['--json']);
                break;
            case 'verifyfiles': // Verify files of a game. Arguments required.
                if(!args || args.length === 0) return mainWindow.webContents.send('args-required');
                spawnLegendaryConsole('verify-game', [args[0]]);
                break;
            case 'installgame': // Install a game. Arguments required.
                if(!args || args.length === 0) return mainWindow.webContents.send('args-required');
                spawnLegendaryConsole('install', [args[0], `--base-path ${appStorage.get('prefs.install_location')}`]);
                break;
            case 'uninstallgame':
                if(!args || args.length === 0) return mainWindow.webContents.send('args-required');
                spawnLegendaryConsole('uninstall', [args[0]]);
                break;
            case 'testinstall': // Test installation of Legendary. Meant for debugging.
                spawnLegendaryConsole('status', ['--offline', '--json']);
                break;
            case 'get-auth': // Get authentication of user
                spawnLegendaryConsole('auth');
                break;
            case 'remove-auth': // Remove authentication
                spawnLegendaryConsole('auth', ['--delete']);
                break;
            default: // Failsafe
                console.warn(chalk.yellow('Invalid Legendary Command'));
                return mainWindow.webContents.send('invalid-command');
        }

    });

    var legendaryCmd = __dirname + '\\legendary\\legendary.exe'
    if(unixShell.which('legendary')) legendaryCmd = 'legendary'

    function spawnLegendaryConsole(command, args) {
        // TODO: Use a package to actually spawn a window with this if enabled
        // --enable-terminal / -t
        if(typeof args === 'object') args = args.join(' ');
        var legendaryTerminal = childProcess.exec(`"${legendaryCmd}" ${command} ${args}`);
    
        legendaryTerminal.stdout.on('data', (data) => {
            mainWindow.webContents.send('legendary-term-data', data);
            console.info('(LEGENDARY) ' + data);
            if(data.startsWith('Do you wish to install') || data.startsWith('Do you wish to uninstall')) {
                legendaryTerminal.stdin.write('y\n');
            } else if(data.startsWith('Please login via the epic web login!')) {
                ipcMain.once('auth-token', (ev, token) => {
                    legendaryTerminal.stdin.write(token + '\n')
                })
            }
        });

        if(args == '--delete') {
            console.log('User logged out')
            mainWindow.webContents.send('force-check');
        }
    
        legendaryTerminal.stderr.on('data', (errorData) => {
            // Don't treat informational lines as errors
            if(errorData.includes('[Core] INFO:') || errorData.includes('[cli] INFO:') || errorData.includes('[DLManager]')) {
                mainWindow.webContents.send('legendary-term-data', errorData);
                console.info('(LEGENDARY) ' + errorData);
                if(errorData.startsWith('[cli] INFO: Successfully logged in as')) {
                    console.log('Successful Login')
                    heirloomWindow.webContents.send('auth-success')
                    heirloomWindow.webContents.send('force-check')
                }
                return;
            } else {
                mainWindow.webContents.send('legendary-error-data', errorData);
                console.error(chalk.red('Legendary encountered an error: ' + errorData));
            }
        });

        legendaryTerminal.on('close', () => {
            return mainWindow.webContents.send('finished-terminal-process');
        });
    }

    mainWindow.webContents.on('new-window', function(event, url) {
        event.preventDefault();
        shell.openExternal(url);
    });

    ipcMain.on('get-debug-info', () => {
        const os = require('os');
        mainWindow.webContents.send('debug-info', `Platform: ${os.type()} ${os.arch()}<br/>Legendary CMD: ${legendaryCmd} (${legendaryCmd == 'legendary' ? 'Existing w/ PATH' : 'Heirloom Install'})<br/>Legendary Version: ${childProcess.execSync(`"${legendaryCmd}" --version`)}`)
    })

}

app.on('ready', startup);
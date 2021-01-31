/*
Program       main.js
Author        Gordon Moore
Date          23 January 2021
Description   The JavaScript code for main entry point for Timer (electron)
Licence       GNU General Public Licence Version 3, 29 June 2007
*/

// #region Version history
/*
0.0.1   Initial version
1.0.0   25 January 2021 Version 1
1.0.1   27 January 2021 Make resizable and add proper build icon

*/
//#endregion 

// Modules
const {app, BrowserWindow} = require('electron') 
const windowStateKeeper = require('electron-window-state')

//Remove for production
// Enable live reload for all the files inside your project directory e.g. html css js
const path = require('path')

//require('electron-reload')(__dirname);
require('electron-reload')(__dirname, {
  electron: path.join(__dirname, 'node_modules', '.bin', 'electron.cmd')
})

//console.log(path.join(process.cwd(), 'node_modules', '.bin', 'electron.cmd') )

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

// Create a new BrowserWindow when `app` is ready
function createWindow () {

  //so we can remember window state
  let winState = windowStateKeeper({
    defaultWidth: 300, defaultHeight: 420
  })

  //Menu.setApplicationMenu(new Menu());
  mainWindow = new BrowserWindow({
    width: winState.width, height: winState.height, 
    x: winState.x, y: winState.y,
    // frame: false,  //this stops divs responding to click events!!
    autoHideMenuBar: true, 
    titleBarStyle: 'hidden',
    backgroundColor: 'lightyellow',
    webPreferences: { nodeIntegration: true },
    alwaysOnTop: true,
    resizable: true,
    minimizable: false,
    maximizable: false,
    opacity: 0.6,
    icon: __dirname + '/build/icon.png',  
    show: false
  })

  winState.manage(mainWindow)

  // Load index.html into the new BrowserWindow
  mainWindow.loadFile('index.html')

  // Open DevTools - Remove for PRODUCTION!
  //nodemainWindow.webContents.openDevTools();

  mainWindow.once('ready-to-show', mainWindow.show) 

  // Listen for window being closed
  mainWindow.on('closed',  () => {
    mainWindow = null
  }) 

}

// Electron `app` is ready
app.on('ready', createWindow)

// Quit when all windows are closed - (Not macOS - Darwin)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// When app icon is clicked and app is running, (macOS) recreate the BrowserWindow
app.on('activate', () => {
  if (mainWindow === null) createWindow()
})

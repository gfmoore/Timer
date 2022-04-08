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

1.1.0   31 January 2021 Add a clock.
1.1.1   4  February 2021 Add date to clock and make clock first
1.1.2   13 February 2021 Do some more work on resizing.
1.1.3   14 February 2021 Add version display
1.1.4   15 February 2021 Reduce font size slightly on counter
1.1.6   8 April 2022 Redo sizing of controls/display. Seem to have lost it?

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
    defaultWidth: 130, defaultHeight: 150
  })

  //Menu.setApplicationMenu(new Menu());
  mainWindow = new BrowserWindow({
    width: winState.width, height: winState.height, 
    x: winState.x, y: winState.y,

    //if screen blows up too big goto C:\Users\Gordon\AppData\Roaming and delete/rename th timer folder
    //this should then be recreated with defaults
    // width: 100, height: 200, 
    // x: 100, y: 200,
    
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

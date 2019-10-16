const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const windowStateKeeper = require('electron-window-state');
const { globalShortcut } = require("electron");
const fs = require('fs');

let mainWindow;

function createWindow () {

  let mainWindowState = windowStateKeeper({
    defaultWidth: 400,
    defaultHeight:70 
  });

  mainWindow = new BrowserWindow({
	  backgroundColor: '#49464e',
		skipTaskbar: false,
	//	resizable: false,
    'x': mainWindowState.x,
    'y': mainWindowState.y,
    'width': mainWindowState.width,
    'height': mainWindowState.height
  });

	console.log("--"+ mainWindowState.width);
	console.log("--"+ mainWindowState.height);
	console.log("--"+ mainWindowState.x);
	console.log("--"+ mainWindowState.y);


  mainWindowState.manage(mainWindow);

  mainWindow.loadURL('file://' + __dirname + '/app/index.html');

  mainWindow.setMenu(null);
	mainWindow.setMenuBarVisibility(false);	
  // Open the DevTools.
  mainWindow.webContents.openDevTools(); 

  mainWindow.on('closed', function () {
    mainWindowState.saveState(mainWindow);
    mainWindow = null;
  });

}

//app.on('ready', createWindow);

app.on('ready', () => {
	globalShortcut.register('alt+f4', function() {
		console.log('You fired ctrl+alt+j !!!');
	});
	createWindow();
  mainWindow.setSize(400,70);
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
	   mainWindow.setSize(400,70);
    app.quit();
  }
});

app.on('activate', function () {
	console.log("activate==="+ mainWindow);
  if (mainWindow === null) {
    createWindow();
  }
});


const {ipcMain} = require('electron')
ipcMain.on('resize-me-please', (event, arg) => {
	if(arg == "initLayer"){
	  mainWindow.setSize(400,70);
	}else if( arg == "viewLayer"){
  	mainWindow.setSize(800,800);
	}else{
		createWindow();
		mainWindow.setSize(400,70);
	}		
})


ipcMain.on('save-dir-path', (event, arg) => {
	console.log("save-dir-path----"+ arg);		
	FnChk_settingsFile();

//console.log("==="+ process.cwd() +"===" + process.env.PWD);

//if (!fs.existsSync(process.cwd() + '/finder-config')) fs.mkdir(process.cwd() + '/finder-config');

	var fileDir = process.cwd() + "/finder-config/finder-env";
	fs.writeFile(fileDir, arg, (err) => {
		if(err){
			console.log("//== save-dir-path() error  "+ err.message)
		}
	});
})

function FnChk_settingsFile(){


	var dirpath = process.cwd() + '/finder-config';
	try{
		 fs.lstatSync(dirpath).isDirectory();
	}catch(e){
	   // Handle error
	   if(e.code == 'ENOENT'){
		   console.log("//==mkdir directory");

			var exec = require('child_process').exec;
			exec(" mkdir "+dirpath,
				function (err, stdout, stderr) {
					console.log('//==stdout: ' + stdout);
					console.log('//==stderr: ' + stderr);
					if (err !== null) {
						console.log('//== mkdir error: ' + err);
					}
			});
	   }
	}
}




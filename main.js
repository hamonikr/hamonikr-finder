const electron = require('electron');
const {Tray, Menu} = require('electron');
const {shell} = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const windowStateKeeper = require('electron-window-state');
const { globalShortcut } = require("electron");
const fs = require('fs');
const mkdirp = require('mkdirp');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readdir);
const mkDirpAsync = promisify(mkdirp);

const CHILD_PADDING = 100;

let mainWindow, settingWindow;

function createWindow () {

	let mainWindowState = windowStateKeeper({
		defaultWidth: 500,
		defaultHeight: 80
	});

	mainWindow = new BrowserWindow({
		skipTaskbar: false,
	//	resizable: false,
		'x': mainWindowState.x,
		'y': mainWindowState.y,
		'width': 500, 
		'height': 80,
		//'height': mainWindowState.height,
		 frame:false,
		 alwaysOnTop: true,
//		 resizable: false,
		  transparent: true
		//  titleBarStyle: 'hidden'
		// titleBarStyle: 'hiddenInset' 
	});

	console.log("--"+ mainWindowState.width);
	console.log("--"+ mainWindowState.height);
	console.log("--"+ mainWindowState.x);
	console.log("--"+ mainWindowState.y);


  	mainWindowState.manage(mainWindow);

  	mainWindow.loadURL('file://' + __dirname + '/app/settings.html');
  	//mainWindow.loadURL('file://' + __dirname + '/app/index.html');

  	mainWindow.setMenu(null);
		mainWindow.setMenuBarVisibility(false);	
  // Open the DevTools.
  //	mainWindow.webContents.openDevTools(); 

		mainWindow.on('closed', function () {
		mainWindowState.saveState(mainWindow);
		mainWindow = null;

	});

}



const toggleWindow = () => {
    mainWindow.isVisible() ? mainWindow.hide() : showWindow();
}
const showWindow = () => {
    const position = getWindowPosition();
    mainWindow.setPosition(position.x, position.y, false);
    mainWindow.show();
}
const getWindowPosition = () => {
    const windowBounds = mainWindow.getBounds();
    const trayBounds = trayIcon.getBounds();
    
    // Center window horizontally below the tray icon
    const x = Math.round(trayBounds.x + (trayBounds.width / 2) - (windowBounds.width / 2))
    // Position window 4 pixels vertically below the tray icon
    const y = Math.round(trayBounds.y + trayBounds.height + 4)
    return {x: x, y: y}
}
const createTray = () => {
	trayIcon  = new Tray(__dirname + '/build/icons/icon16.png');
	//tray.setTitle('hello world');
	const trayMenuTemplate = [
		{
		   label: 'Hamonikr-finder',
		   //enabled: false
			click: function (){
				toggleWindow();
		   }
		},
		{
		   label: 'Settings',
		   click: function () {
			  console.log("Clicked on settings");
			  settingWindow.show();
			  console.log("Clicked on settings222");
		   }
		},
		{
		   label: 'Help',
		   click: function () {
			  console.log("Clicked on Help")
		   }
		},
		{ label: 'Quit', click: () => { app.quit(); } }
	 ]
	 
	 let trayMenu = Menu.buildFromTemplate(trayMenuTemplate)
	 trayIcon.setContextMenu(trayMenu)
}
let trayIcon  = null;
app.on('ready', () => {
	createTray();
	globalShortcut.register('alt+f4', function() {
		console.log('You fired ctrl+alt+j !!!');
	});
	setTimeout(createWindow, 500)
	//createWindow();
 	//mainWindow.setSize(450,60);
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
	   mainWindow.setSize(500,70);
	 //  mainWindow.hide();
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
		mainWindow.setResizable(true);
		mainWindow.setSize(500,80);
	}else if( arg == "viewLayer"){
  		mainWindow.setSize(550, 540);
		 // esRequest();
	}else{
		createWindow();
		mainWindow.setSize(500,80);
	}		
})
ipcMain.on('openFile', (event, path) => {
  console.log("main.js=-====" + path);
//  shell.showItemInFolder(path);
  shell.openItem(path);

});


ipcMain.on('openConfigFile', (event, path) => { 
	var osType = require('os');
  	var filepath  = osType.homedir() + '/.config/hamonikr_finder/finder_config';

	fs.readFile(filepath, 'utf-8', (err, data) => { 
		if(err){ 
			console.log("An error ocurred reading the file :" + err.message);
			return 
		}else{
			console.log("data==="+ data);
			
			var settingData_arr = data.split('\n');
			// for(var i=0; i<settingData_arr.length ;++i){
			// 	console.log(i+'=====' + settingData_arr[i]);
			// }
			// console.log("settingData_arr==="+ settingData_arr);
			event.sender.send('settingData_arr', data);

			console.log("uuid info success");
		}
	});
});


const osType = require('os');
const dir  = osType.homedir() + '/.config/hamonikr_finder'

ipcMain.on('save-dir-path', (event, arg) => {
	// 설정 폴더 생성.
	makeRecursiveFileAsync(dir, arg);
})

//const makeRecursiveFileAsync = async(data, fileNm) => {
const makeRecursiveFileAsync = async(dir, arg) => {
   try{
//      var json = data;
//			var osType = require('os');
//		  var dir  = osType.homedir() + '/.config/hamonikr_finder'
      //var makeDirpAsync = await mkDirpAsync(dir);
			//var makeFileTmp = await userInfoWriteFile();
			//var uuidRestApiChk = await test3();

			// 폴더 및 파일 유무 체크
			var chkFile = FnChk_settingsFile();
			console.log("chkFile==="+ chkFile);
			if( chkFile == false ){
				var makeDirpAsync = await mkDirpAsync(dir);
				var makeFileTmp = await userInfoWriteFile();
			}

			//파일의 uuid가 디비에 존제 여부
			var chkUuidInFile = await readUuidFile();
			//var chkUuidDb = await uuid_db_chk(chkUuidInFile);
			var chkUuidDb = await getToken(chkUuidInFile);
			
			// 색인 폴더 설정
			var makeWatchFile = await create_settingFile(arg);
			var es_index = await esIndexExists(chkUuidInFile);
			console.log("aaaaaaaaaaaaaaaaaa");
			var watcher_call = await watcherCall(chkUuidInFile);
			console.log("bbbbbbbbbbbbbbbbbbbb");
      return "true";
   }
   catch(err){
	 	console.log("error");
       return Object.assign(err);
   }
}

const request = require('request');
function uuid_db_chk(arg){
	return new Promise((resolve, reject) => {

	console.log("dbchk ==== "+ arg);

		const formData = {
	    userUuid:  arg
	  };
		console.log("formdata====" + formData);
	  request.post({url: "http://127.0.0.1:3001/userinfo", formData: formData}, async (err, response, body) => {
	    if (err) return reject(err);
	
	    const result = body; // JSON.parse(body);
			console.log("dbchk===result ==="+ result);
			resolve("true");
		});
	});
}

function readUuidFile(){
return new Promise(function(resolve, reject){
  var osType = require('os');
  var dirpath = osType.homedir() + '/.config/hamonikr_finder/userinfo_config';

		fs.readFile(dirpath, (err, data) => {
      if (err)  { reject("false")}
      else {
				var os = require("os");
				var text = data.toString().split(os.EOL);
				console.log( "===============================+> "+ text.length);
				console.log( "===============================+> "+ text[0]+"===");

        console.log("=data==="+text[0]+"===");
        resolve(text[0]);
        
      }
    });

	});
}


function FnChk_settingsFile(){
	var osType = require('os');
  var dirpath = osType.homedir() + '/.config/hamonikr_finder/userinfo_config';

  try{
   // var retVal =  fs.lstatSync(dirpath).isDirectory();
	 var retVal = fs.existsSync(dirpath);
		console.log("FnChk_settingsFile====="+ retVal);
		return retVal;
  }catch(e){
     // Handle error
     if(e.code == 'ENOENT'){
       console.log("//==mkdir directory");
			 return "false";
     }
  }
}
function userInfoWriteFile(){
  return new Promise(function(resolve, reject){
    var uniqid = require('uniqid');
    var osType = require('os');
    var fileDir  = osType.homedir() + '/.config/hamonikr_finder/userinfo_config';
    var arg = uniqid()+(new Date()).getTime().toString(36);

    if (!fs.existsSync(fileDir)) {
      fs.writeFile(fileDir, arg, (err) => {
        if(err){
          reject("error");
          console.log("//== save-dir-path() error  "+ err.message);
        }
         resolve(arg);
      });
    }else{
       resolve(arg);
    }
  });
}

function getToken(result){
	return new Promise((resolve,reject) => {
	console.log("getTokent------ "+ result);
		var unirest = require('unirest');
		unirest.post('http://127.0.0.1:3001/userinfo')
			.headers('Accept', 'application/json')
			.send({ "userUuid": result })
			.end(function (response) {
				if(response.error){return reject(error)}
				//return resolve(response.body.ops[0].user_uuid);
				console.log("gettoken rest ===== "+ JSON.stringify(response.body));
				return resolve(response.body);
			});
		})
}


function chkUuid(){
	return new Promise(function(resolve, reject){
	  var osType = require('os');
	  var fileDir  = osType.homedir() + '/.config/hamonikr_finder/userinfo_config';
	  let returnVal = "";
	  
	 // var data = fs.readFileSync(fileDir, 'utf8');a
		fs.readFile(fileDir, (err, data) => {
		  if (err)  { reject("false")}
			else { 
				resolve("true");
			  console.log(data);
			}
		});
	});
}

//  es index create 
function esIndexExists(arg){
  return new Promise(function(resolve, reject){
		console.log("esindexcreate============================");
    var headersOpt = { 
      "content-type": "application/json",
    };
    request({
        method:'post',
        url:'http://127.0.0.1:3001/api/indexExists',
        form: {'userUuid':  arg},
        headers: headersOpt,
        json: true,
      }, async function (error, response, body) {
          console.log("esIndex====" +body);
					if(!error){
						resolve("true");
					}else{
						reject("false");
					}
					
      }
    );
  });
}


//  watcher dir info 
function watcherCall(arg){
  return new Promise(function(resolve, reject){
		console.log("watcher call===================");
		var headersOpt = {  
  	  "content-type": "application/json",
		};
		request({
  	  	method:'post',
  	    url:'http://127.0.0.1:3001/watcher',
  	    form: {'userUuid':  arg}, 
  	    headers: headersOpt,
  	    json: true,
  	  }, function (error, response, body) {  
  	      console.log(body);  
					if(!error){
            resolve("true");
          }else{
            reject("false");
          }

			}
		); 
  });
}


//	watcher dir info 
function create_settingFile(arg){
  return new Promise(function(resolve, reject){
    var osType = require('os');
    var fileDir  = osType.homedir() + '/.config/hamonikr_finder/finder_config';

    if (!fs.existsSync(fileDir)) {
      fs.writeFile(fileDir, arg, (err) => {
        if(err){
          reject("error");
          console.log("//== save-dir-path() error  "+ err.message);
        }
         resolve(arg);
      });
    }else{
       resolve(arg);
    }
  });
}


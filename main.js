const electron = require('electron');
const {Tray, Menu} = require('electron');
const {shell} = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const windowStateKeeper = require('electron-window-state');
const { globalShortcut } = require("electron");
const fs = require('fs');

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
  	mainWindow.webContents.openDevTools(); 

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

ipcMain.on('save-dir-path', (event, arg) => {
	console.log("save-dir-path----"+ arg);		
	//FnChk_settingsFile();

	//setTimeout(create_settingFile, 600, arg);
	
	//setTimeout(userInfo, 600, '');
	//setTimeout(watcherCall, 600, '');

	test(arg);

})



async function test( arg ){
//create_userInfoFile

	await testCreateMkdir();

	await test1();
	//const uuidTmp = await test2();
	//console.log("u---"+ uuidTmp);
	await test3();

}

function testCreateMkdir(){
     var osType = require('os');
    var fileDir  = osType.homedir() + '/.config/hamonikr_finder'
fs.promises.mkdir(fileDir, {recursive: true}).then(x => fs.promises.writeFile(fileDir+"/test.txt", "Hey there!"));

//	return new Promise((resolve, reject) => {
//	   var osType = require('os');
//    var fileDir  = osType.homedir() + '/.config/hamonikr_finder2';
//
//        fs.mkdir(fileDir, 0o777, function(stats, err) {
//          if (err) {
//            return reject(err);
//          }
//
//          return resolve(true);
//     		});
//     	}).catch((err) => {
//     		   logger.error(err);
//     		   return err;
//     		 })
			

 // return new Promise(function(resolve, reject){
 //   var uniqid = require('uniqid');
 //   var osType = require('os');
 //   var fileDir  = osType.homedir() + '/.config/hamonikr_finder2';
 // 	
 //   resolve("async는 Promise방식을 사용합니다.");
 // });
}



function test1(){
	return new Promise(function(resolve, reject){
  	console.log("num1");
		var uniqid = require('uniqid');
		var osType = require('os');
	  var fileDir  = osType.homedir() + '/.config/hamonikr_finder/userinfo_config';
		var arg = uniqid()+(new Date()).getTime().toString(36);
	  
		if (!fs.existsSync(fileDir)) {
	    fs.writeFile(fileDir, arg, (err) => {
	      if(err){
	        console.log("//== save-dir-path() error  "+ err.message);
	      }
				 resolve("async는 Promise방식을 사용합니다.");
	    });
	  }else{
			 resolve("async는 Promise방식을 사용합니다.");
    }

//    resolve("async는 Promise방식을 사용합니다.");
  });
}

function test2(){
  return new Promise(function(resolve, reject){
    console.log("num2===================");
		var osType = require('os');
	  var fileDir  = osType.homedir() + '/.config/hamonikr_finder/userinfo_config';
	  const userIndexUUID = fs.readFileSync(fileDir);
	  console.log("userInfoData====="+ userIndexUUID);
	  console.log("---------------------------userInfoData====="+ userIndexUUID);
    resolve(userIndexUUID);
  });
}

function getToken(result){
	return new Promise((resolve,reject) => {
		var unirest = require('unirest');
		unirest.post('http://127.0.0.1:3001/userinfo')
			.headers('Accept', 'application/json')
			.send({ "userUuid": result })
			.end(function (response) {
				if(response.error){return reject(error)}
				//return resolve(response.body.ops[0].user_uuid);
				console.log(JSON.stringify(response.body));
				return resolve(response.body);
			});
		})
}

function test3(){
	var osType = require('os');
  var fileDir  = osType.homedir() + '/.config/hamonikr_finder/userinfo_config';
  let returnVal = "";

 var data = fs.readFileSync(fileDir, 'utf8');
	console.log("adddd====="+ data);
	getToken(data).then(function (data) {
	  console.log("then===="+data); // response 값 출력
	}).catch(function (err) {
	  console.error("then===err===="+ err); // Error 출력
	});

	//fs.readFile(fileDir, 'utf8', function(err, result){
  //	if(err) throw err;
  //    var unirest = require('unirest');
  //    unirest.post('http://127.0.0.1:3001/userinfo')
  //      .header('Accept', 'application/json')
  //      .send({ "userUuid": result })
  //      .end(function (response) {
  //        console.log("=======>"+response.body.ops[0].user_uuid);
  //      }
	//		   //.end(function (response) {
	//	     //  return new Promise((resolve, reject) => {
	//	     //    if(response) {
	//	     //    		console.log("1-----"+ response.body.ops[0].user_uuid);
	//			 // 			returnVal = response.body.ops[0].user_uuid;
	//	     //      	resolve(response.body.ops[0].user_uuid)
	//	     //    }
	//	     //    if(error){
	//	     //      reject(response)
	//	     //    }
	//	     //  })
	//	     //}
  //    );
  //});


		//var unirest = require('unirest');
    //unirest.post('http://127.0.0.1:3001/userinfo')
  	//  .header('Accept', 'application/json')
	  //  .send({ "userUuid": uuid })
		//	.end(function (response) {
    //  	return new Promise((resolve, reject) => {
    //  	  if(response) {
		//			console.log("1-----"+ uuid);
    //  	    resolve(response)
    //  	  }
    //  	  if(error){
		//				console.log("22==="+ uuid);
    //  	    reject(response)
    //  	  }
    //  	})
		//	}
    // );

}


function userInfo(){

	let path = require('path');
	var uniqid = require('uniqid');
	//create_userInfoFile(uniqid()+(new Date()).getTime().toString(36));

	var osType = require('os');
  var fileDir  = osType.homedir() + '/.config/hamonikr_finder/userinfo_config';
	var buf = uniqid()+(new Date()).getTime().toString(36);
	fs.writeFile(fileDir, buf, function(err) {
	//fs.writeFile(path.join(__dirname, '/sample.txt'), buf, function(err) {
        if(err) throw err;
        console.log('쓰기 완료');

        // 콜벡 안에 또 콜벡
        fs.readFile(fileDir, 'utf8', function(err, result){
            if(err) throw err;
            console.log("읽기 : " + result);

						var unirest = require('unirest');
  					unirest.post('http://127.0.0.1:3001/userinfo')
  					  .header('Accept', 'application/json')
  					  .send({ "userId": result })
  					  .end(function (response) {
  					    console.log("=======>"+response.body);
  					  }
  					);

        });
    });


  //var unirest = require('unirest');
  //unirest.post('http://127.0.0.1:3001/profile')
  //  .header('Accept', 'application/json')
  //  .send({ "userId": $("#userId").val(), "groupNm": $("#groupNm").val() })
  //  .end(function (response) {
  //    console.log(response.body);
  //  }
  //);
}

function watcherCall(){

	//var osType = require('os');
  //var fileDir  = osType.homedir() + '/.config/hamonikr_finder/userinfo_config';
	//let userInfoData = "";
  //fs.access(fileDir, error => {
  //  if (!error) {
  //      // The check succeeded
  //       userInfoData = fs.readFileSync(fileDir);
  //      console.log("userInfoData====="+ userInfoData);

  //  } else {
  //    console.log("aaa");
  //      // The check failed
  //  }
  //});

	const request=require('request');
	request('http://127.0.0.1:3001/watcher',function(error, response, body){
  	if(!error&&response.statusCode==200) {
    	console.log(body);
   	}else{
    	console.log("error----" + error);
    }
	});


}

//	watcher dir info 
function create_settingFile(arg){

  var osType = require('os');
  var fileDir  = osType.homedir() + '/.config/hamonikr_finder/finder_config';

	console.log("====filepath==="+ fileDir);
  fs.writeFile(fileDir, arg, (err) => {
    if(err){
      console.log("//== save-dir-path() error  "+ err.message);
    }
  });
}

// user info uuid 
function create_userInfoFile(arg){

  var osType = require('os');
  var fileDir  = osType.homedir() + '/.config/hamonikr_finder/userinfo_config';

	if (!fs.existsSync(fileDir)) {
  	console.log("====filepath==="+ fileDir);
  	fs.writeFile(fileDir, arg, (err) => {
  	  if(err){
  	    console.log("//== save-dir-path() error  "+ err.message);
  	  }
  	});
	}else{
		console.log('aaaaaaaaaaaaaaaa');
		}
}


function FnChk_settingsFile(){

	var osType = require('os');
	var dirpath = osType.homedir() + '/.config/hamonikr_finder/';
	
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

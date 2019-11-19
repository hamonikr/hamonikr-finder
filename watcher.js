const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const chokidar = require('chokidar');
const request = require('request');
const Router = require('koa-router');
const watcher = new Router();
const rp = require('request-promise');
const axios = require('axios');
const FormData = require('form-data');
const concat = require("concat-stream");

var searchPathAry = new Array();
function getSearchPath(){

	var osType = require('os');
	var fileDir = osType.homedir() + '/.config/hamonikr_finder/finder_config';
  var tmpStr = fs.readFileSync(fileDir, 'utf8');
  var arrPath = tmpStr.split('\n');

  for(var i=0; i<arrPath.length-1; i++){
    searchPathAry[i] = arrPath[i];
  }
}


const ES_UPLOAD_PATH = 'http://192.168.0.55:8081/_upload'
const DB_FILE = './db/files.db';
//const FILE_FOLDER = '/home/rnd/test-file';
const FILE_FOLDER = searchPathAry;
const FileSharing = "PV";
const initializeDB = () => {

  //const dropQuery = `DROP TABLE IF EXISTS filelist`;
  
	return new Promise((resolve, reject) => {
					const insertQuery = `CREATE TABLE IF NOT EXISTS filelist(
																file_id INTEGER PRIMARY KEY AUTOINCREMENT,
																local_path VARCHAR(100),
																url VARCHAR(20))`;
						
					const db = new sqlite3.Database(DB_FILE, sqlite3.OPEN_CREATE | sqlite3.OPEN_READWRITE, (err) => {
						if (err) {
							return console.error(err.message);
						}
						
						db.serialize(() => {
							// db.each(dropQuery);
							db.run(insertQuery);
						})
						
						db.close((err) => {
							if (err) {
								return reject(console.error(err.message));
							}

							console.log('init db close');
							return resolve('done');
						});
					});
	});
}

const maintest = async (userUuid) => {
	const watcher = chokidar.watch(FILE_FOLDER, {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true
  });

	watcher.on('ready', function() {
    console.log('Newly watched paths:', watcher.getWatched());
  });

}

const main = async (userUuid) => {

	const userIndexUUID = userUuid;
	const res = fs.existsSync(DB_FILE);
	if (res == false) {
		console.log("initializeDB");
  	await initializeDB();
	}
	console.log("initializeDB next");


  const db = new sqlite3.Database(DB_FILE, sqlite3.OPEN_READWRITE);

  process.on('exit', function () {
    db.close((err) => {
      if (err) {
        return console.error(err.message);
      }
      console.log('Close the database connection.');
    });
    console.log('Goodbye!');
  });
  
  

  const watcher = chokidar.watch(FILE_FOLDER, {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true
  });

  //watcher.on('ready', function() {
  //  console.log('Newly watched paths:', watcher.getWatched());
  //});

  let runningCnt = 0;
  watcher.on('all', async (event, path) => {
  	// console.log("path====> "+ path.split("."));


    const asyncQuery = (query) => {
      return new Promise((resolve, reject) => {
        // console.log(`${query}`);
        db.all(query, [], (err, rows) => {
          if (err) {
            return reject(err);
          }
  
          // console.log(`rows.length = ${rows.length}`);

          (rows.length > 0) ? resolve(true) : resolve(false);
        });
      });
    };
    
    // console.log(event, path);
    if (event == 'addDir') {
      console.log(`Ignore addDir ${path}`);
    }

    if (event == 'unlinkDir') {
      console.log(`Ignore unlinkDir ${path}`);
    }
    
    if (event == 'add') {
      runningCnt++;
			const createTagFile = async (path) => {
    	  return new Promise( async (resolve, reject) => {
    	    var arg = "{\"external\":{\"description\":\""+path +" \"}}";
          fs.writeFileSync(process.cwd() + "/tagtest" + runningCnt +".txt", arg, 'utf8');
        });
      };

      const fsrestUpload = (path) => {
				return new Promise((resolve, reject) => {

console.log("======================================================aaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
          const formData = {
            //index: 'myindex',
            index: userIndexUUID,
            file: fs.createReadStream(path),
            tags: fs.createReadStream("tagtest" + runningCnt +".txt")
          };
          request.post({url: ES_UPLOAD_PATH, formData: formData}, async (err, response, body) => {
            if (err) {
							console.log("error==================="+err);
							return reject(err);
						}
            
            const result = JSON.parse(body);
						console.log("result========================="+ result);
            if (result.ok == false) {
              return console.log('upload failed');
            }

            // console.log('업로드 한 파일의 hash 값을 local DB 에 저장한다.');
            const addQuery = `insert into filelist(local_path, url) values ('${path}', '${result.url}')`;
            const res = await asyncQuery(addQuery);

            console.log('DB insert 되었는지 확인');
            const query = `SELECT * FROM filelist WHERE local_path = '${path}'`;
            //const found = await asyncFind(query);
            const found = await asyncQuery(query);
            if (err) {
              return console.error("error indsert === "+ err.message);
            }else{
              
              

            }
            // runningCnt = 0;
            resolve(runningCnt);
            //console.log('post resolved');
          });
				});
      };
      //var arg = "{\"external\":{\"description\":\""+path +" \"}}";
			var arg = "{\"external\":{\"description\":\""+path +" \", \"FileSharing\":\""+FileSharing+"\", \"owner_uuid\":\""+userIndexUUID+"\", \"owner_nm\":\""+userIndexUUID+"\"}}";
      fs.writeFileSync(process.cwd() + "/tagtest" + runningCnt +".txt", arg, 'utf8');
      await fsrestUpload(path).then(  
        fs.unlink(process.cwd() + "/tagtest" + runningCnt +".txt", (err) => {
          if (err) {
            console.error(err)
            return
          }
          //file removed
        })
      );
      console.log("aaaaaaaaaaaaaaaaaaaaaaaaaa");
      runningCnt = 0;        
      
    }
    // console.log("tttaaa==="+ runningCnt);
    if (event == 'change') {
      console.log('파일이 변경된 경우');
      const query = `SELECT * FROM filelist WHERE local_path = '${path}'`;
      const found = await asyncQuery(query);

      if (found == false) {
        return console.log(`Local DB 에서 파일을 찾을 수 없음.`);
      }
      
      // console.log(`여기서 ES 서버에 파일을 다시 업로드 할 것... ${path}`);
      request.post({url: ES_UPLOAD_PATH, formData: {file: fs.createReadStream(path)}}, async (err, response, body) => {
        if (err) {
          return console.error('upload failed:', err);
        }
        
        const result = JSON.parse(body);
				console.log("resu==="+ result);
        if (result.ok == false) {
          return console.log('upload failed');
        }
      });
    }

    if (event == 'unlink') {
      // console.log('파일을 삭제하는 경우')
      const delQuery = `DELETE FROM filelist WHERE local_path = '${path}'`;
      const res = await asyncQuery(delQuery);

      console.log(`여기서 ES 서버 데이터 삭제할 것 ... ${path}`);
    }
  });
};

function watcherstart(arg){
  console.log('action~~~  ' + JSON.stringify(arg));
  getSearchPath();
  main();
}

//module.exports = {
//	start: watcherstart()
//};

module.exports = {
	start: function(arg){
	  getSearchPath();
 	main(arg);
// maintest(arg);
	}
};



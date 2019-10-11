const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const chokidar = require('chokidar');
const request = require('request');
const Router = require('koa-router');
const watcher = new Router();


var searchPathAry = new Array();
function getSearchPath(){
  var tmpStr = fs.readFileSync('./searchconfigfile', 'utf8');
  var arrPath = tmpStr.split('\n');
  for(var i=0; i<arrPath.length-1; i++){
    searchPathAry[i] = arrPath[i];
  }
}


const ES_UPLOAD_PATH = 'http://192.168.0.55:8081/_upload'
const DB_FILE = './db/files.db';
//const FILE_FOLDER = '/home/rnd/test-file';
const FILE_FOLDER = searchPathAry;

const initializeDB = async () => {

  const dropQuery = `DROP TABLE IF EXISTS filelist`;
  
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
        return console.error(err.message);
      }
    });
  });
}

const res = fs.existsSync(DB_FILE);
if (res == false) {
  initializeDB();
  console.log('SQlite DB 초기화됨 - 다시 실행하세요.');
//  return;
}

const db = new sqlite3.Database(DB_FILE, sqlite3.OPEN_READWRITE);

const main = async () => {
  process.on('exit', function () {
    db.close((err) => {
      if (err) {
        return console.error(err.message);
      }
      console.log('Close the database connection.');
    });
    console.log('Goodbye!');
  });
  
  console.log('chokidar.watch 시작');

  chokidar.watch(FILE_FOLDER).on('all', async (event, path) => {


	console.log("path====> "+ path.split("."));


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
      // console.log(`폴더에 파일이 추가 ${path}`);

      const query = `SELECT * FROM filelist WHERE local_path = '${path}'`;
      const found = await asyncQuery(query);

      if (found) {
        // console.log('프로그램 처음 실행시 모든 파일을 add 한다. local DB에 있으면 skip한다.');
        console.log(`found ${path}`);
        return;
      }

      // console.log('tags 에 파일 세팅할 것');
      const formData = {
        index: 'myindex',
        file: fs.createReadStream(path),
        // tags: ''
      };
      
      // console.log('여기서 파일을 업로드 할 것 ...');
      request.post({url: ES_UPLOAD_PATH, formData: formData}, async (err, response, body) => {
        if (err) {
          return console.error('upload failed:', err);
        }
        
        const result = JSON.parse(body);
        if (result.ok == false) {
          return console.log('upload failed');
        }
        
        // console.log(body);
        // {"ok":true,"filename":"test.txt","url":"http://192.168.0.55:9200/macbook/_doc/dd18bf3a8ea2a3e53e2661c7fb53534"}

        // console.log(path);
        // console.log(result.url);

        // console.log('업로드 한 파일의 hash 값을 local DB 에 저장한다.');
        const addQuery = `insert into filelist(local_path, url) values ('${path}', '${result.url}')`;
        const res = await asyncQuery(addQuery);

         console.log('DB insert 되었는지 확인');
         const query = `SELECT * FROM filelist WHERE local_path = '${path}'`;
         //const found = await asyncFind(query);
         const found = await asyncQuery(query);
      })
    }

    if (event == 'change') {
      // console.log('파일이 변경된 경우');
      const query = `SELECT * FROM filelist WHERE local_path = '${path}'`;
      const found = await asyncQuery(query);

      if (found == false) {
        return console.log(`Local DB 에서 파일을 찾을 수 없음.`);
      }
      
      console.log(`여기서 ES 서버에 파일을 다시 업로드 할 것... ${path}`);
      
      request.post({url: ES_UPLOAD_PATH, formData: {file: fs.createReadStream(path)}}, async (err, response, body) => {
        if (err) {
          return console.error('upload failed:', err);
        }
        
        const result = JSON.parse(body);
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


getSearchPath();
main();

module.exports = watcher;


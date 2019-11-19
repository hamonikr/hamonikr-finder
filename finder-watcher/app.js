//const express = require('express');
//const app = express();

const Koa = require('koa');
const Router = require('koa-router');
const koaBody = require('koa-body');
const app = new Koa();
const router = new Router();
const mongo = require('./MongoCon/mongoconf')
const bodyParser = require('koa-bodyparser');

// Require the Router
const api = require('./Esproxy/api');
app.use(mongo())
app.use(koaBody());
app.use(router.routes()).use(router.allowedMethods());

router.use('/api', api.routes()); 

// Server
var port = 3001;
app.listen(port, function(){
  console.log('listening on port:' + port);
});

//	Watcher
router.post('/watcher', async (ctx, next) => {
	console.log("watcher==================+++");
  console.log("useruuid==="+ ctx.request.body.userUuid);
  console.log("gubun === "+ ctx.request.body.gubun);
	var watcherObj = ctx.request.body.userUuid;
	var gubun = ctx.request.body.gubun;

	if( gubun == "PV"){
		const watcher = require('./watcher');
	  watcher.start(watcherObj);
	}else{
		var groupIndexNm = ctx.request.body.groupIndexNm;
		var userNm = ctx.request.body.userNm;
		const pr_watcher = require('./pr_watcher');
	  pr_watcher.start(watcherObj, groupIndexNm, userNm);
	}
	//const watcher = require('./watcher');
  //watcher.start(watcherObj);
	//
	//const pr_watcher = require('./pr_watcher');
  //pr_watcher.start(watcherObj);

});

router.post('/aaa', koaBody(),
  (ctx) => {
    console.log(ctx.request.body);
    // => POST body
    ctx.body = JSON.stringify(ctx.request.body);
  }
);

router.post('/profile', async (ctx, next) => {
console.log(" profile ==================+++");
    console.log(ctx.request.body);
    var profileObj = ctx.request.body;
    console.log("userid === "+ profileObj.userId);
    console.log("groum name == "+ profileObj.groupNm);
		console.log("useruuid === "+ profileObj.userUuid);

		const tmp = await ctx.db.collection('test_users').updateOne({ user_uuid: profileObj.userUuid},{ $set:{ user_nm: profileObj.userId, group_nm: profileObj.groupNm}})
		console.log("===tmp===="+ tmp);
  }
);

router.post('/userinfo', async (ctx) => {
    const profileObj = ctx.request.body;
		var uuidTmp = profileObj.userUuid;
		let chkUuid = "";

		const userUuidVal = await ctx.db.collection('test_users').findOne({"user_uuid":uuidTmp});

		if( userUuidVal == null  ){
				console.log("Insert");
				ctx.body = await ctx.db.collection('test_users').insertOne({ user_uuid: uuidTmp, group_nm: '', user_nm: '' }); //, (err, result) => {
				ctx.body = ctx.body.ops[0].user_uuid;
		}else{
			ctx.body = userUuidVal.user_uuid;
		}
  }
);

// Mongo
router.post('/select', async(ctx) => {
  console.log("select----------");
	var profileObj = ctx.request.body;
  var uuidTmp = profileObj.userUuid;
	console.log("uuidtmp===="+ uuidTmp);
  //ctx.body = await ctx.db.collection('test_users').find().toArray()
	ctx.body = await ctx.db.collection('test_users').findOne({"user_uuid":uuidTmp});
});


router.get('/insert', async(ctx) => {
  console.log("insert-------------");
	await ctx.db.collection('test_users').insertOne({ user_id: 'example', status: 'aa', group_nm: 'groupnm', user_nm: 'usernm' })
});



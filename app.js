//const express = require('express');
//const app = express();

const Koa = require('koa');
const Router = require('koa-router');
const koaBody = require('koa-body');
const app = new Koa();
const router = new Router();
const mongo = require('./MongoCon/mongoconf')


// Require the Router
const api = require('./Esproxy/api');
app.use(mongo())


// Use the Router on the sub route /api
router.use('/api', api.routes()); 
//router.use('/mongoApi', mongoApi.routes()); 

app.use(koaBody());
app.use(router.routes()).use(router.allowedMethods());


// Server
var port = 3001;
app.listen(port, function(){
  console.log('listening on port:' + port);
});

//	Watcher
router.get('/watcher', (req, res) => {
	const watcher = require('./watcher');
	watcher.start;
});


router.post('/aaa', koaBody(),
  (ctx) => {
    console.log(ctx.request.body);
    // => POST body
    ctx.body = JSON.stringify(ctx.request.body);
  }
);

router.post('/profile', async (ctx, next) => {
console.log("es==================+++");
    console.log(ctx.request.body);
    var profileObj = ctx.request.body;
    console.log(profileObj.userId);
    console.log(profileObj.groupNm+"==nm");

		const tmp = await ctx.db.collection('test_users').updateOne({ userUuid: profileObj.userUuid},{ $set:{ user_id: profileObj.userId, group_nm: profileObj.groupNm}})
		console.log("===tmp===="+ tmp);
  }
);

router.post('/userinfo', async (ctx) => {
console.log("userinfo==================+++");
    const profileObj = ctx.request.body;
		var uuidTmp = profileObj.userUuid;
		let chkUuid = "";

		const userUuidVal = await ctx.db.collection('test_users').findOne({"user_uuid":uuidTmp});
    console.log("ab----"+ JSON.stringify(userUuidVal));

		if( userUuidVal == null  ){
				console.log("Insert");
				ctx.body = await ctx.db.collection('test_users').insertOne({ user_uuid: uuidTmp, group_nm: '', user_nm: '' }); //, (err, result) => {
 				//  if(err) console.log(err);
				//  else {
				//		 console.log("retu-------" +result.ops[0].user_uuid)
				//		 chkUuid = result.ops[0].user_uuid;
				//		 ctx.body = chkUuid;
				//		 return chkUuid;
				// }
				//});
				ctx.body = ctx.body.ops[0].user_uuid;
		}else{
			ctx.body = userUuidVal.user_uuid;
		}
	

		console.log('c======' + ctx.body);
	//	return ctx.body = userUuidVal.user_uuid;
		//var doc = await ctx.db.collection('test_users').findOne({"user_id":"3ocmlf04qyk2tsintrk2tsintq"});
    //var doc1 = await ctx.db.collection('test_users').find({"user_id":"3ocmlf04qyk2tsintrk2tsintq"}).toArray();
    //console.log(doc);
    //console.log(doc1 );


  }
);

// Mongo
router.get('/select', async(ctx) => {
  console.log("select----------");
  ctx.body = await ctx.db.collection('test_users').find().toArray()
});


router.get('/insert', async(ctx) => {
  console.log("insert-------------");
	await ctx.db.collection('test_users').insertOne({ user_id: 'example', status: 'aa', group_nm: 'groupnm', user_nm: 'usernm' })
});



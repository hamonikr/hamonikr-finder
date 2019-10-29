//const express = require('express');
//const app = express();

const Koa = require('koa');
const Router = require('koa-router');
const koaBody = require('koa-body');
const app = new Koa();
const router = new Router();


// Require the Router
const api = require('./Esproxy/api');


// Use the Router on the sub route /api
router.use('/api', api.routes()); 

app.use(koaBody());
app.use(router.routes()).use(router.allowedMethods());


// Server
var port = 3001;
app.listen(port, function(){
  console.log('listening on port:' + port);
});


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
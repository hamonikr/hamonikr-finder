//const express = require('express');
//const app = express();

const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-body');

const app = new Koa();
const router = new Router();

//Set up body parsing middleware
app.use(bodyParser({
   formidable:{uploadDir: './uploads'},
   multipart: true,
   urlencoded: true
}));


//const path       = require('path');
//const bodyParser = require('body-parser');
//
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({extended: true}));
//app.use(function (req, res, next) { //1
//  res.header('Access-Control-Allow-Origin', '*');
//  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
//  res.header('Access-Control-Allow-Headers', 'content-type');
//  next();
//});

//app.get('/', (req, res) => {
//  res.send('Hello World!\n');
// });


// Router
//router.get('/', (ctx, next) => {
//    ctx.body = require('./api/search');
//});
//router.all('/:id', ctx => {
//  ctx.require('./api/search/:id');
//});

// Require the Router
const api = require('./api');

// Use the Router on the sub route /api
router.use('/api', api.routes()); 

app.use(router.routes()).use(router.allowedMethods());


// Server
var port = 3001;
app.listen(port, function(){
  console.log('listening on port:' + port);
});

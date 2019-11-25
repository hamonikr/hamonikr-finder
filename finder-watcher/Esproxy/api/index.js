const Router = require('koa-router');
const api = new Router();
const bodyParser = require('koa-body');
const rp = require('request-promise')
const esClient = require('./client');



async function fn_EsQuery(keyword, indexName){
  var retVal="";
  //const body = {
  //  "query": {
  //      "match" : {
  //          "content" : "*"+keyword+"*"
  //      }
  //  }
  //  //,"_source": [ "content", "file", "path", "external" ]
  //}
  const body = {
	size: 1000,
      query: {
          query_string: {
            query: "*"+keyword+"*" //"한글",
           // , default_field: "content"
          }
      }
  }
  try {
	//	esClient.initIndex
		const resp = await esClient.searchDoc(indexName, '', body);
    //console.log("body========================+" + JSON.stringify(body));

		var dataJsonArray = new Array();
			
    resp.hits.hits.forEach(function(hit){
    	console.log(hit._source.file.filename);
      var dataJson = new Object();
			dataJson.filename = hit._source.file.filename;
			dataJson.extension = hit._source.file.extension;
			dataJson.filepath = hit._source.external.description;
		
			dataJson.fileSharing = hit._source.external.FileSharing;
			dataJson.owner_nm = hit._source.external.owner_nm;


			console.log("1===>"+ hit._source.external.description);
			console.log("2===>"+ hit._source.external.FileSharing);
			console.log("3===>"+ hit._source.external.owner_uuid);
			console.log("4===>"+ hit._source.external.owner_nm);

			dataJsonArray.push(dataJson);
    })

		var jsonRet = JSON.stringify(dataJsonArray);
		//	console.log(jsonRet);

  } catch (e) {
      console.log(e);
  }
  return jsonRet;
}



//	es search 
 api.get('/esa/:id', async (ctx, next) => {
 //  var aa = await fn_EsQuery(ctx.params.id);
//   console.log("\n----"+aa+"---\n");
var aa = ctx.params.id;
 	ctx.body = { message : aa };
 });


api.post('/es', async (ctx, next) => {
console.log("es==================+++");
    console.log(ctx.request.body);
    var esResultObj = ctx.request.body;
    console.log(esResultObj.id); 
    console.log(esResultObj.userUuid); 
    
    var aa = await fn_EsQuery(esResultObj.id, esResultObj.userUuid);
    console.log("\n----"+aa+"---\n");
    ctx.body = { message : aa };
  }
);


//	es index create
api.get('/escreate/:id', async (ctx, next) => {
	console.log("aa===="+ ctx.params.id);
	var indexName = ctx.params.id;
	esClient.initIndex(indexName);	
});

// es exists and create
api.post('/indexExists', async (ctx, next) => {
	
//  console.log("aa===="+ ctx.params.id);
  var indexName = ctx.request.body.userUuid;
  var indexChk = await esClient.indexExists(indexName).then();
	if( indexChk == false){
		esClient.initIndex(indexName)
	}
	ctx.body = "true";
});


//	es delete document 
api.get('/esdelete/:id/:documentName', async (ctx, next) => {
	console.log("aa===="+ ctx.params.id);
	console.log("aa===="+ ctx.params.documentName);
	var indexName = ctx.params.id;
	var documentName = ctx.params.documentName;
	esClient.deleteIndex(indexName, documentName);	
});

module.exports = api;

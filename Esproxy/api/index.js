const Router = require('koa-router');
const api = new Router();
const bodyParser = require('koa-body');
const rp = require('request-promise')
const esClient = require('../client');
const searchDoc = async function(indexName, mappingType, dataload){
    return await esClient.search({
        index: indexName,
//        type: mappingType,
        body: dataload
    });
}

module.exports = searchDoc;

async function fn_EsQuery(keyword){
  var retVal="";
  const body = {
    "query": {
        "match" : {
            "content" : "*"+keyword+"*"
        }
    },
    "_source": [ "content", "file", "path", "external" ]
  }
  // const body = {
  //     query: {
  //         //match: {
  //         //    "title": "Learn"
  //         //}

  //         query_string: {
  //           query: "*"+keyword+"*" //"한글",
  //           , default_field: "content"
  //         }
  //     }
  // }
  try {
		const resp = await searchDoc('myindex', '', body);
    console.log("body========================+" + JSON.stringify(body));
    console.log(resp);
//			console.log("===rest info === "+ JSON.stringify(resp.hits));


		var dataJsonArray = new Array();
			
    resp.hits.hits.forEach(function(hit){
    	console.log(hit._source.file.filename);
      var dataJson = new Object();
      //retVal += hit._source.file.filename+"\n=="+hit._source.file.extension+"\n=="+hit._source.external.description;
			dataJson.filename = hit._source.file.filename;
			dataJson.extension = hit._source.file.extension;
			dataJson.filepath = hit._source.external.description;

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
// api.get('/es/:id', async (ctx, next) => {
//   var aa = await fn_EsQuery(ctx.params.id);
//   console.log("\n----"+aa+"---\n");
// 	ctx.body = { message : aa };
// });

// api.all('/es', bodyParser(), (ctx, next) => {
//   console.log("\n post----"+ctx.request.body+"---\n");
//   console.log("\n post----"+ctx.params[0]+"---\n");
//   console.log("\n post----"+ctx.body+"---\n");
// });


api.post('/es', async (ctx, next) => {
console.log("es==================+++");
    console.log(ctx.request.body);
    var esResultObj = ctx.request.body;
    console.log(esResultObj.id); 
    
    var aa = await fn_EsQuery(esResultObj.id);
    console.log("\n----"+aa+"---\n");
    ctx.body = { message : aa };
  }
);


//	es index create
api.get('/escreate', async (ctx, next) => {
	checkIndices();
});

function checkIndices() {
    esClient.indices.exists({index: 'users'}, (err, res, status) => {
        if (res) {
            console.log('index already exists');
        } else {
            esClient.indices.create( {index: 'users'}, (err, res, status) => {
            console.log(err, res, status);
        })
      }
    })
}



module.exports = api;

const Router = require('koa-router');
const api = new Router();
const rp = require('request-promise')
const esClient = require('../client');
const searchDoc = async function(indexName, mappingType, payload){
    return await esClient.search({
        index: indexName,
//        type: mappingType,
        body: payload
    });
}

module.exports = searchDoc;

async function fn_EsQuery(keyword){
  var retVal="";
  const body = {
      query: {
          //match: {
          //    "title": "Learn"
          //}

          query_string: {
            query: keyword, //"한글",
            default_field: "content"
          }
      }
  }
  try {
      const resp = await searchDoc('', '', body);
        console.log(resp);

      resp.hits.hits.forEach(function(hit){
//        console.log(hit._source.file.filename+"=="+hit._source.file.extension)
        retVal += hit._source.file.filename+"=="+hit._source.file.extension;
      })
  } catch (e) {
      console.log(e);
  }
  return retVal;
}




api.get('/es/:id', async (ctx, next) => {
  var aa = await fn_EsQuery(ctx.params.id);
  console.log("\n----"+aa+"---\n");

	ctx.body = { message : aa };
});



module.exports = api;

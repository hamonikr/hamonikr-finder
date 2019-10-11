const esClient = require('./client');
const searchDoc = async function(indexName, mappingType, payload){
    return await esClient.search({
        index: indexName,
//        type: mappingType,
        body: payload
    });
}

module.exports = searchDoc;


async function test(){
    const body = {
        query: {
            //match: {
            //    "title": "Learn"
            //}

						query_string: {
        		  query: "한글",
    		      default_field: "content"
		        }
        }
    }
    try {
        const resp = await searchDoc('', '', body);
//        console.log(resp);
		
				resp.hits.hits.forEach(function(hit){
  	      console.log(hit._source.file.filename+"=="+hit._source.file.extension)
	      })
    } catch (e) {
        console.log(e);
    }
}


test();

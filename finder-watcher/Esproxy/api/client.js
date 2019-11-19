const es = require('elasticsearch');
const esClient = new es.Client({
    host: '192.168.0.55:9200'
 //   ,log: 'trace'
		,requestTimeout: 3000
    //,log: 'trace'
});

//module.exports = esClient;
const searchDoc = async function(indexName, mappingType, dataload){
    return await esClient.search({
//				index: ['3ocmlf075ak2vfatq8k2vfatq7', 'test_gruop_a'],
//				index: ['test_gruop_a'],
        index: indexName,
//        type: mappingType,
        body: dataload
    });
}

//module.exports = searchDoc;
exports.searchDoc = searchDoc;


function initIndex(indexName) {
    return esClient.indices.create({
        index: indexName
    });
}
exports.initIndex = initIndex;


function indexExists(indexName) {
    return esClient.indices.exists({
        index: indexName
    });
}
exports.indexExists = indexExists;


function deleteIndex(indexName) {
    return esClient.indices.delete({
        index: indexName
    });
}
exports.deleteIndex = deleteIndex;

const es = require('elasticsearch');
const esClient = new es.Client({
    host: '192.168.0.56:9200'
    //,log: 'trace'
});

module.exports = esClient;

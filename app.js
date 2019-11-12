const http = require('http');
const handler = require('./webhooks');

http.createServer((req, res) => {
    handler(req, res, err => {
        res.statusCode = 404;
        res.end('no such location')
    })
}).listen(8410);



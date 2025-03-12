var express = require('express');
var router = express.Router();

var DOMPurify = require('isomorphic-dompurify');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('craft', {request: req});
});

router.post('/', function (req, res, next) {
    let requestData = '';
    req.on('data', chunk => {
        requestData += chunk.toString();
    }).on('end', () => {
        requestInfo = {
            method: req.method,
            url: DOMPurify.sanitize(req.url),
            ip: req.ip,
            headers: req.headers,
            body: requestData
        };
        req.body = JSON.parse(requestData);
        req.body.url = encodeURI(DOMPurify.sanitize( req.body.url));
        if (!(req.body['url'] == '/craft' || req.body['url'] == "/logs" || req.body['url'] == "/api/logs"))
            crafterlogs[req.body['url']] = req.body;
        res.json({success: true});
    });

});

router.delete('/', function (req, res, next) {
    let requestData = '';
    req.on('data', chunk => {
        requestData += chunk.toString();
    }).on('end', () => {
        requestInfo = {
            method: req.method,
            url: req.url,
            ip: req.ip,
            headers: req.headers,
            body: requestData
        };
        req.body = JSON.parse(requestData);
        var url_to_delete = req.body.url;
        delete crafterlogs[url_to_delete];
        res.json({success: true});
    });
});

module.exports = router;

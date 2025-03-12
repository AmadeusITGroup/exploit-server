var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('logs', { requestlogs: requestlogs });
});

router.delete('/', function(req, res, next) {
    global.requestlogs = [];
    io.emit('logDeleted');
    res.json({success: true});
});

module.exports = router;

var express = require('express');
var router = express.Router();

// API
router.get('/logs', (req, res) => {
    var s = 0;
    var e = 10;
    var ex;
    try {
        s = req.query.start;
        e = req.query.end;
        if (typeof s === 'undefined')
            s = 0;
        if (typeof e === 'undefined')
            e = requestlogs.length;
        s=parseInt(s);
        e=parseInt(e);
        if (s<0)
            s=0;
        if (e>requestlogs.length-1)
            e=requestlogs.length-1;
        ex = requestlogs.slice(s, e + 1);
    } catch {
        s = 0;
        e = 10;
        ex = requestlogs;
    }
    res.json(ex);
});

router.get('/craft', (req, res) => {
    res.json(crafterlogs);
});

module.exports = router;

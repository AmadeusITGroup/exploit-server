var express = require('express');
var router = express.Router();

/* GET home page. */
router.all('*', function(req, res, next) {
    if (req.url.startsWith("/socket.io")) {
        return next();
    }
    req.url = DOMPurify.sanitize(decodeURI(req.url));
    if (req.url in crafterlogs) {
        const headers_list = crafterlogs[req.url]['header'].split('\n');
        const firstterm = headers_list.shift();
        const status_ret = firstterm.split(" ")[1];
        res.status(status_ret)
        headers_list.forEach(header => {
            var splitted = header.split(":");

            var name = splitted[0];
            const value = splitted.slice(1).join(':');;

            res.set(name.trim(), value.trim());
        });

        res.send(crafterlogs[req.url]['body']);
    } else {
        res.render('generic', { request: req });
    }
});

module.exports = router;

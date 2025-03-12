var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var logsRouter = require('./routes/logs');
var craftRouter = require('./routes/craft');
var apiRouter = require('./routes/api');
var crypto = require("crypto-js");
var app = express();
var server = require('http').createServer(app);

global.io = require('socket.io')(server);

var DOMPurify = require('isomorphic-dompurify');

const aes_key = process.env.EXPLOIT_SERVER_KEY;


global.requestlogs = [];
global.crafterlogs = {};

function sendNewLogVar(json) {
    io.emit('newLog', json);
}


function isJSON(maybe_json) {
    try {
        const body = JSON.parse(maybe_json);
        if (typeof body === 'object') {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        return false;
    }
}

function encrypt_data(cleartext) {
    return crypto.AES.encrypt(cleartext.toString(), aes_key.toString()).toString();
}

const logRequest = (req, res, next) => {
    const now = new Date();
    let requestData = '';
    let requestInfo = {};
    req.on('data', chunk => {
        requestData += chunk.toString();
    }).on('end', () => {
        //var copyheader = req.headers.map(x => DOMPurify.sanitize(x.toString()));
        requestInfo = {
            method: DOMPurify.sanitize(req.method),
            url: DOMPurify.sanitize(req.url),
            ip: DOMPurify.sanitize(req.ip),
            headers: JSON.parse(DOMPurify.sanitize(JSON.stringify(req.headers))),
            body: DOMPurify.sanitize(requestData)
        };
        if ((req.url !== '/logs') && (req.url !== '/craft') && (!req.url.startsWith('/socket.io'))) {
            var newlog = {now: now, request: requestInfo, expanded: false};
            var requestInfoString = JSON.stringify(requestInfo);
            var encryptedRequestInfoString = encrypt_data(requestInfoString);
            var newEncryptedLog = {now: now, request: encryptedRequestInfoString};
            requestlogs.push(newEncryptedLog);
            sendNewLogVar(newEncryptedLog);
        }
        if (isJSON(requestData)) {
            req.body = JSON.parse(requestData);
        }
    });
    next();
};

app.use('/socket.io', express.static(path.join(__dirname, 'node_modules/socket.io/client-dist')));

// API
app.use('/api', apiRouter);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.locals.reqlog = requestlogs;

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/logs', logsRouter);
app.use('/craft', craftRouter);

app.use(logRequest);
app.use('/', indexRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});


server.listen(3000, function() {
  console.log('Socket IO server listening on port 3000');
});

module.exports = app;

/*jslint node: true */
'use strict';
var express = require('express'),
    user = require('./routes/user'),
    ssul = require('./routes/ssul'),
    tok = require('./routes/tok'),
    
    server = express();

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', req.headers.origin ? req.headers.origin : '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'X-CSRF-Token, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    next();
  }
  
server.use(express.bodyParser());
server.use(allowCrossDomain);

//user
server.get('/dummy/users/me', user.user_me);
server.post('/dummy/signin', user.signin);
server.post('/dummy/signout', function (req, res) {res.json(200, {'ok': true, 'status': '200'});});
server.post('/dummy/users', function (req, res) {res.json(200, {'ok': true, 'status': '200'});});
//ssuls
server.get('/dummy/ssul.it/ssuls', ssul.ssuls);
server.post('/dummy/ssul.it/ssuls', function (req, res) {res.json(200, {'ok': true, 'status': '200'});});
//ssul
server.get('/dummy/ssul.it/ssuls/:id/:created', ssul.ssul);
//talk
server.get('/dummy/ssul.it/ssuls/:author/:created/toks', tok.toks);
server.post('/dummy/ssul.it/ssuls/:author/:created/toks', function (req, res) {res.json(200, {'ok': true, 'status': '200'});});

server.options('/*', function (req, res) {res.json(200, {'ok': true, 'status': '200'});});

server.use(function (req, res) {
  res.json(404, {'ok': false, 'status': '404'});
});

module.exports = server;
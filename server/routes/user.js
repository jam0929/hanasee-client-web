/*jslint node: true */
'use strict';
exports.user_me = function(req, res) {
  res.json(200, {
    "id": "test@test.com",
    "email": "test@test.com",
    "name": "test"
  });
};

exports.signin = function(req, res) {
  res.json(200, {
    "id": "test@test.com",
    "email": "test@test.com",
    "name": "test"
  });
};
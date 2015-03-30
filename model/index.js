var level = require('level');
var sublevel = require('level-sublevel');

var opts = {
    valueEncoding: 'json',
    cacheSize: 32 << 20
};
var db = sublevel(level('./db', opts));

var post = require('./post');
exports.post = function(username, keychain) {
    return post(db, username, keychain);
};

var user = require('./user');
exports.user = function() {
    return user(db);
};
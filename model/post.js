var Q = require('q');
Q.longStackSupport = true;
var util = require('./util');

var Post = function(db, username, keychain) {
    this.username = username;
    this.password = keychain[keychain.length-1].password;
    this.keychain = keychain;
    this.db = db.sublevel(username).sublevel('posts');
};

module.exports = function(db, username, keychain) {
    return new Post(db, username, keychain);
};

Post.prototype.getMany = function(opts) {
    var deferred = Q.defer();
    var opts = opts || {};
    var before = opts['before'] || util.now();
    var limit = opts['limit'] || 10;
    var posts = [];

    this.db.createReadStream({
        lt: before,
        limit: limit,
        reverse: 1
    }).on('data', function(data) {
        posts.push({
            id: data.key,
            created: util.date(data.key),
            title: data.value.title
        });
    }).on('end', function() {
        deferred.resolve(posts);
    }).on('error', deferred.reject);

    return deferred.promise;
};

Post.prototype._findPassword = function(date) {
    for (var i = 0; i < this.keychain.length-1; i++) {
        if (this.keychain[i+1].created > date) {
            return this.keychain[i].password;
        }
    }

    return this.keychain[this.keychain.length-1].password;
};

Post.prototype.get = function(id) {
    var self = this;

    return Q.nfcall(this.db.get, id)
        .then(function(data) {
            data.created  = util.date(id);
            data.modified = util.date(data.modified);

            var password = self._findPassword(data.modified);
            data.text = util.decipher(data.text, password);

            return data;
        });
};

Post.prototype._put = function(id, data) {
    data['title'] = data['text'].split('\n')[0].trim();
    data['text']  = util.cipher(data['text'], this.password);
    data['modified'] = util.now();

    return Q.nfcall(this.db.put, id, data);
};

Post.prototype.new = function(text) {
    var id = util.uniqId();
    var data = { text: text };

    return this._put(id, data);
};

Post.prototype.update = function(id, text) {
    var self = this;
    return Q.nfcall(this.db.get, id)
        .then(function(data) {
            data['text'] = text;
            return self._put(id, data);
        });
};
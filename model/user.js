var Q = require('q');
Q.longStackSupport = true;
var util = require('./util');

var User = function(db) {
    this.db = db;
};

module.exports = function(db) {
    return new User(db);
};

User.prototype._check = function(username, password) {
    var db = this.db.sublevel(username);
    return Q.nfcall(db.get, 'settings')
        .then(function(data) {
            if (data.password == util.hash(password, username)) {
                return {status: 'valid'};
            } else {
                throw new Error('invalid');
            }
        }, function() {
            throw new Error('invalid');
        });
};

User.prototype.getLogged = function(cookies, ipAddress, expires) {
    if (!('username' in cookies) ||
        !('keychain' in cookies) ||
        !('session' in cookies)
    ) {
        return Q.fcall(function() {
            throw new Error('not_logged');
        });
    }

    var username = cookies['username'],
        sessionId = cookies['session'],
        keychainCiphered = cookies['keychain'],
        db = this.db.sublevel(username).sublevel('session');

    return Q.nfcall(db.get, sessionId)
        .then(function(data) {
            if (data.ipAddress != ipAddress) {
                throw new Error('ip_address_mismatch');
            }

            if (data.expires < util.now()) {
                throw new Error('session_expired');
            }

            var keychain = util.decipher(keychainCiphered, data.cipherKey, 1);
            return {
                'username': username,
                'keychain': keychain
            };
        });
};

User.prototype._createSession = function(username, password, ipAddress, cb) {
    var db = this.db.sublevel(username).sublevel('session'),
        sessionId = util.randHash('session'),
        cipherKey = util.randHash('key'),
        data = {
            ipAddress: ipAddress,
            expires: util.now(30 * 24 * 60 * 60 * 1000), // expires
            cipherKey: cipherKey
        };

    return Q.nfcall(db.put, sessionId, data)
        .then(function() {
            return {
                status: 'logged_in',
                cipherKey: cipherKey,
                sessionId: sessionId
            };
        });
};

User.prototype.login = function(username, password, ipAddress) {
    var self = this;
    return this._check(username, password, ipAddress)
        .then(function() {
            return self._createSession(username, password, ipAddress);
        }).then(function(data) {
            return self._getKeychain(username, password)
                .then(function(keys) {
                    data.keychain = util.cipher(keys, data.cipherKey, 1);
                    return data;
                });
        });
};

User.prototype.register = function(username, password) {
    var self = this;
    return this._check(username, password)
        .then(function() {
            throw new Error('username_taken');
        }, function() {
            var db = self.db.sublevel(username);
            var settings = {
                    password: util.hash(password, username),
                    email: username
                };

            return Q.allSettled([
                    Q.nfcall(db.put, 'settings', settings),
                    self._updateKeychain(username, password)
                ]).then(function() {
                    return 'success';
                });
        });
};

User.prototype.changePassword = function(username, newPass, oldPass) {
    var self = this;
    var db = this.db.sublevel(username);
    return this._check(username, password)
        .then(function() {
            return Q.allSettled([
                    Q.nfcall(db.),
                    self._updateKeychain(username, newPass, oldPass)
                ]);
        });
};

User.prototype._getKeychain = function(username, password) {
    var db = this.db.sublevel(username).sublevel('keychain');
    var keys = [];
    var deferred = Q.defer();

    db.createReadStream().on('data', function(data) {
        console.log(data.value, password);
        keys.push({
            id: data.key,
            created: util.date(data.key),
            password: util.decipher(data.value, password)
        })
    }).on('end', function() {
        deferred.resolve(keys);
    }).on('error', deferred.reject);

    return deferred.promise;
};

User.prototype._updateKeychain = function(username, newPass, oldPass) {
    var db = this.db.sublevel(username).sublevel('keychain');

    if (oldPass) {
        this._getKeychain(username, oldPass)
            .then(function(keys) {
                keys.forEach(function(item) {
                    db.del(item.id);
                    item.password = util.cipher(item.password, newPass);
                    db.put(item.id, item.password);
                });
            });
    }

    var id = util.now();
    var data = util.cipher(newPass, newPass);
    db.put(id, data);
};
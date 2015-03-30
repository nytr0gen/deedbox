var crypto = require('crypto');

/**
 * Current unix timestamp in seconds
 * Length 8 characters
 * @param {int} future Time to add
 * @return {hex} timestamp
 */
exports.now = function(future) {
    var date = Date.now() + (future || 0);

    return Math.floor(date / 1000).toString(16);
};

/**
 * Helper for readable date
 * @param  {hex} date timestamp
 * @return {Date}
 */
exports.date = function(date) {
    date = date.substring(0, 8);
    date = parseInt(date, 16);

    return new Date(date * 1000);
}

/**
 * Random hex generator
 * @param  {int} num
 * @return {hex} length 2 * num
 */
exports.randHex = function(num) {
    var ret = '';
    while (num--) {
        ret += Math.floor((1 + Math.random()) * 0x100).toString(16).substring(1);
    }

    return ret;
}

/**
 * Generates an unique id for every post
 * Sortable by timestamp / Length 14 characters
 * Collisions after 16 ** 3 = 4096 calls per seconds
 * @return {hex} id
 */
exports.uniqId = function() {
    var id = exports.now(); // Unix timestamp in seconds
    id += exports.randHex(3); // Randomized hex

    return id;
};

/**
 * Cipher with aes128
 * Add signature
 * @param  {string} data
 * @param  {string} password
 * @return {base64}
 */
exports.cipher = function(data, password, json) {
    if (typeof data == 'undefined') throw 'undefined in cipher';

    if (json) {
        data = JSON.stringify(data);
    }

    var cipher = crypto.createCipher('aes128', password);
    var result = cipher.update(data, 'utf8', 'base64');
    result += cipher.final('base64');

    return result;
};

/**
 * Decipher with aes128
 * @param  {base64} data
 * @param  {string} password
 * @return {string}
 */
exports.decipher = function(data, password, json) {
    if (typeof data == 'undefined') throw 'undefined in decipher';

    var decipher = crypto.createDecipher('aes128', password);
    var result = decipher.update(data, 'base64', 'utf8');
    result += decipher.final('utf8');

    if (json) {
        result = JSON.parse(result);
    }

    return result;
};

/**
 * Recipher with aes128
 * @param  {hex} data    ciphered with aes
 * @param  {string} newPass
 * @param  {string} oldPass
 * @return {hex}         reciphered data
 */
exports.recipher = function(data, newPass, oldPass) {
    data = exports.decipher(data, oldPass);
    data = exports.cipher(data, newPass);

    return data;
};

/**
 * Hash a salted string with ripemd160
 * @param  {string} value
 * @param  {string} salt
 * @return {hex}
 */
exports.hash = function(value, salt) {
    var hash = crypto.createHash('ripemd');
    hash.update(value);
    if (salt) {
        hash.update(salt);
    }

    return hash.digest('hex');
};

/**
 * Random hash for session ids etc..
 * @param  {string} salt
 * @return {hex}
 */
exports.randHash = function(salt) {
    var rand = exports.randHex(10);

    return exports.hash(rand, salt);
};

/**
 * Fisher-Yates Shuffle
 * @param  {array|string} array
 * @return {array|string} depends on the input
 */
exports.shuffle = function(array) {
    if (typeof array == 'string') {
        var isString = true;
        array = array.split('');
    }

    var n = array.length, i, tmp;
    while (n) {
        i = Math.floor(Math.random() * n--);

        tmp = array[i];
        array[i] = array[n];
        array[n] = tmp;
    }

    return !isString ? array : array.join('');
};
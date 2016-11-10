module.exports = (function () {
    let crypto = require('crypto'),
        algorithm = 'aes-256-ctr',
        password = 'hell yeah! this is my "password" :)';

    return {
        en : function (text) {
            let cipher = crypto.createCipher(algorithm, password);
            let en = cipher.update(text, 'utf8', 'hex');
            en += cipher.final('hex');
            return en;
        },
        de : function (hash) {
            let decipher = crypto.createDecipher(algorithm, password);
            let de = decipher.update(hash, 'hex', 'utf8');
            de += decipher.final('utf8');
            return de;
        }
    }
})();
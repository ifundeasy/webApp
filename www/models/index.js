let fs = require('fs');
let path = require('path');
module.exports = function (mongoose, obj) {
    let o = {};
    let d = path.resolve(obj.directory);
    fs.readdirSync(d).forEach(function (file) {
        let location = path.resolve(obj.directory, file);
        let modelName = path.basename(location, '.js');
        if ((modelName.indexOf(".") !== 0) && modelName != 'index') {
            o[modelName] = require(location)(mongoose, {
                regEx : obj.regEx,
                getCode4 : obj.getCode4,
                factory : obj.factory
            });
        }
    });
    return o;
};
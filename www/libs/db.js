let Db = function (mongoose, config) {
    this.mongoose = mongoose;
    this.url = this.setURL(config);
    return this;
};
Db.prototype.open = function (config) {
    let me = this;
    let url = me.url;
    let o = {
        db : {native_parser : true},
        server : {poolSize : 5},
        promiseLibrary : require('q')
    };
    if (config.name) url += config.name;
    if (config.username) o.user = config.username;
    if (config.password) o.pass = config.password;
    //
    console.log(process.pid.toString(), 'Connecting', url);
    //
    me.mongoose.connect(url, o, function (err) {
        config.onListen(err, me)
    });
};
Db.prototype.setURL = function (config) {
    let s = 'mongodb://';
    if (config.username && config.password) s += [config.username, config.password].join(':') + '@';
    s += [config.host, (config.port || "27017")].join(':');
    s += '/';
    return s
};
module.exports = Db;
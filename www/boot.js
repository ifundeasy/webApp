module.exports = function (base) {
	let domain = "localhost";
	let libdir = base + 'libs/';
	let configdir = base + 'config/';
	let modeldir = base + 'models/';
	let routedir = base + 'routes/';
	let port = parseInt(process.env.PORT || process.env.npm_package_port || 3000);
	let getIp = function () {
		try {
			return require(libdir + 'getip')();
		} catch (e) {
			return domain;
		}
	};
	let obj = {
		reqTimeOut : 2 * 60 * 1000,
		name: process.env.npm_package_name || "webApp",
		description: process.env.description || "",
		version: process.env.version || "1.0.0",
		port: port,
		home : base,
		libs : libdir,
		models : modeldir,
		config : configdir,
		routes : routedir,
		factory : 7,
		getCode4 : require(libdir + 'code4'),
		parties : {
			domain : domain + (port !== "80" ? ":" + port : ""),
			mail : require(configdir + 'mail'),
			mongodb : require(configdir + 'mongodb')
		},
		ip : getIp(),
		regEx : {
			//email : /[a-z0-9]+[_a-z0-9\.-]*[a-z0-9]+@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})/i,
			email : /^(?:(?:[\w`~!#$%^&*\-=+;:{}'|,?\/]+(?:(?:\.(?:"(?:\\?[\w`~!#$%^&*\-=+;:{}'|,?\/\.()<>\[\] @]|\\"|\\\\)*"|[\w`~!#$%^&*\-=+;:{}'|,?\/]+))*\.[\w`~!#$%^&*\-=+;:{}'|,?\/]+)?)|(?:"(?:\\?[\w`~!#$%^&*\-=+;:{}'|,?\/\.()<>\[\] @]|\\"|\\\\)+"))@(?:[a-zA-Z\d\-]+(?:\.[a-zA-Z\d\-]+)*|\[\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\])$/i,
			phone : /^\s*(?:\+?(\d{1,3}))?([-. (]*(\d{3})[-. )]*)?((\d{3})[-. ]*(\d{2,4})(?:[-.x ]*(\d+))?)\s*$/i,
			username : /^[a-zA-Z0-9]*$/i,
			password : /[a-zA-Z0-9\_\~\!\@\#\$\%\^\&\*\(\)\_\+\`\-\=\[\]\\\{\}\|\;\'\:\"\,\.\/\<\>\?]+/i,
			zipcode : /(^\d{5}([\-]?\d{4})?$)|(^(GIR|[A-Z]\d[A-Z\d]??|[A-Z]{2}\d[A-Z\d]??)[ ]??(\d[A-Z]{2})$)|(\b((?:0[1-46-9]\d{3})|(?:[1-357-9]\d{4})|(?:[4][0-24-9]\d{3})|(?:[6][013-9]\d{3}))\b)|(^([ABCEGHJKLMNPRSTVXY]\d[ABCEGHJKLMNPRSTVWXYZ])\ {0,1}(\d[ABCEGHJKLMNPRSTVWXYZ]\d)$)|(^(F-)?((2[A|B])|[0-9]{2})[0-9]{3}$)|(^(V-|I-)?[0-9]{5}$)|(^(0[289][0-9]{2})|([1345689][0-9]{3})|(2[0-8][0-9]{2})|(290[0-9])|(291[0-4])|(7[0-4][0-9]{2})|(7[8-9][0-9]{2})$)|(^[1-9][0-9]{3}\s?([a-zA-Z]{2})?$)|(^([1-9]{2}|[0-9][1-9]|[1-9][0-9])[0-9]{3}$)|(^([D-d][K-k])?( |-)?[1-9]{1}[0-9]{3}$)|(^(s-|S-){0,1}[0-9]{3}\s?[0-9]{2}$)|(^[1-9]{1}[0-9]{3}$)|(^\d{6}$)/i
		}
	};
	obj.connect = function (callback) {
		let mongodb = obj.parties.mongodb;
		let mongoose = require(obj.libs + 'mongoose');
		let Db = require(obj.libs + 'db');
		new Db(mongoose, mongodb.connection).open(mongodb.database);
		mongodb.database.onListen = callback;
	};
	return obj
};
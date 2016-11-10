const fs = require('fs'),
	path = require('path'),
	http = require('http'),
	child = require('child_process'),
	express = require('express'),
	cookieParser = require('cookie-parser'),
	bodyParser = require('body-parser'),
	morgan = require('morgan'),
	cors = require('cors'),
	session = require('express-session'),
	Store = require('connect-mongo'),
	dateformat = require('dateformat'),
	nodemailer = require("nodemailer"),
	bcrypt = require('bcrypt'),
	httpCode = http.STATUS_CODES;
//
module.exports = function (glob, database) {
	let app = express();
	//
	//process.send({key: "hello", type: "subscribe", from: process.pid, message: "Yeah, I'm in.."});
	//process.on('message', function (obj) {
	//	console.log(process.pid.toString(), `subscribed by ${obj.moderator}..`, obj.message);
	//});
	//
	app.set('title', glob.name);
	app.set('port', glob.port);
	app.set('x-powered-by', false);
	app.set('views', path.join(glob.home, 'views/'));
	app.set('view engine', 'ejs');
	//
	app.use(cookieParser());
	app.use(express.static(path.join(glob.home, 'bower_components')));
	app.use(express.static(path.join(glob.home, 'public')));
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({extended: true}));
	app.use(cors());
	app.use(function (req, res, next) {
		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
		res.render('index');
	});
	//
	return app;
};
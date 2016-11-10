const cluster = require('cluster');
const http = require('http');
let basedir = `${process.env.PWD || __dirname}/`;
//
if (cluster.isMaster) {
	let master = require(`${basedir}src/master`);
	let numWorkers = require('os').cpus().length;
	//
	console.log('Master cluster setting up ' + numWorkers + ' workers...');
	//
	for (let i = 0; i < numWorkers; i++) {
		let worker = cluster.fork();
		master.addWorker(worker);
	}
	cluster.on('online', function (worker) {
		console.log(worker.process.pid.toString(), 'Online');
	});
	cluster.on('death', function (worker) {
		console.error(worker.process.pid.toString(), 'Death!');
	});
	cluster.on('exit', function (worker, code, signal) {
		console.error(worker.process.pid.toString(), 'Died with code :', code + ', and signal :', signal);
		master.killWorker(worker);
		//master.addWorker(cluster.fork());
	});
} else {
	let boot = require(`${basedir}boot`)(basedir);
	boot.connect(function (e, database) {
		if (!e) {
			console.log(process.pid.toString(), 'Connected to mongodb');
			let app = require(`${basedir}src/app`)(boot, database);
			let server = http.createServer(app);
			//
			server.timeout = boot.reqTimeOut;
			server.on('error', function onError(error) {
				if (error.syscall !== 'listen') throw error;
				let bind = typeof boot.port === 'string' ? 'Pipe ' + boot.port : 'Port ' + boot.port;
				switch (error.code) {
					case 'EACCES':
						console.error(bind + ' requires elevated privileges');
						process.exit(1);
						break;
					case 'EADDRINUSE':
						console.error(bind + ' is already in use');
						process.exit(1);
						break;
					default:
						throw error;
				}
			});
			server.on('listening', function onListening() {
				let host = server.address();
				let port = typeof host === 'string' ? host : host.port;
				host = host == "::" ? 'localhost' : host.address;
				console.log(process.pid.toString(), `Listening on ${host.address || 'localhost'}:${port}`);
			});
			server.listen(boot.port);
		} else {
			console.log('> Error open connection', err)
		}
	});
}
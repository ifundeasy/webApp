let Events = {};
Events.hello = function (message, opts) {
	let me = Events.hello;
	let workers = me.replayTo;
	let sender = me.from;
	for (let w in workers) {
		let relay = workers[w];
		let msg = me.setMessage(`Woooop! You got message from ${w}, he said '${message}'`);
		relay.send(msg)
	}
};
//
module.exports = (function (events) {
	const Audience = function () {
		let me = this;
		me.workers = {};
		return me;
	};
	Audience.prototype.addWorker = function (worker) {
		let me = this;
		me.workers[worker.process.pid] = worker;
		worker.on('message', function (message) {
			let obj = message || {};
			let key = obj.key;
			if (Events.hasOwnProperty(key)) {
				let fn = Events[key];
				fn.key = key;
				fn.setMessage = function (message) {
					return {key: me.key, sender: fn.from.process.pid, moderator: process.pid, message: message}
				};
				if (fn.constructor == Function) {
					fn.numbOfWorker = 1;
					fn.from = me.workers[obj.from];
					if (!obj.type || obj.type !== "subscribe") {
						fn.replayTo = {
							[obj.from]: fn.from
						};
					} else {
						fn.replayTo = me.workers;
						fn.numbOfWorker = Object.keys(me.workers).length;
					}
					console.log("> Audience", fn.from.process.pid.toString(), `subscribe via master, this message for pid :`, Object.keys(fn.replayTo).join(", "));
					fn(obj.message, obj);
				}
			}
		});
		return worker;
	};
	Audience.prototype.killWorker = function (worker) {
		let me = this;
		delete me.workers[worker.process.pid];
		return worker;
	};
	Audience.prototype.Events = events;
	//
	return new Audience();
})(Events);
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
//
let app = express();
let server = http.createServer(app);
let socket = socketIO(server);
let port = parseInt(process.env.PORT || process.env.npm_package_port || 3000) + 1;
//
app.use(function (req, res) {
	res.send({message : "hello guys!"});
});
//
let numUsers = 0;
socket.on('connection', function (client) {
	let addedUser = false;
	// when the client emits 'new message', this listens and executes
	client.on('new message', function (data) {
		// we tell the client to execute 'new message'
		client.broadcast.emit('new message', {
			username: client.username,
			message: data
		});
	});
	// when the client emits 'add user', this listens and executes
	client.on('add user', function (username) {
		if (addedUser) return;
		// we store the username in the client session for this client
		client.username = username;
		++numUsers;
		addedUser = true;
		client.emit('login', {
			numUsers: numUsers
		});
		// echo globally (all clients) that a person has connected
		client.broadcast.emit('user joined', {
			username: client.username,
			numUsers: numUsers
		});
	});
	// when the client emits 'typing', we broadcast it to others
	client.on('typing', function () {
		client.broadcast.emit('typing', {
			username: client.username
		});
	});
	// when the client emits 'stop typing', we broadcast it to others
	client.on('stop typing', function () {
		client.broadcast.emit('stop typing', {
			username: client.username
		});
	});
	// when the user disconnects.. perform this
	client.on('disconnect', function () {
		if (addedUser) {
			--numUsers;
			// echo globally that this client has left
			client.broadcast.emit('user left', {
				username: client.username,
				numUsers: numUsers
			});
		}
	});
});
server.listen(port, function () {
	console.log('Server listening at port %d', port);
});
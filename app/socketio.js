'use strict';

function init(app) {
	
	const server = require('http').Server(app);
	const io = require('socket.io')(server);
	
	const userMap = {};
	const userArr = [];

	io.on('connection', (sock)=>{
		console.log('client connect');
		let username;

		sock.emit('yourid', sock.id);
		sock.on('myname', (data)=>{
			const name = data.name;
			const id = data.id;

			if (sock.id == id) {
				username = data.name;
				
				userMap[username] = {
					name: username,
					liked: 0,
					avatar: "/user_avatar/test.ico"
				}
				userArr.push(userMap[username]);

				sock.emit('get all user', userArr);
			}
		})

		sock.on('chat message', (mes)=>{
			if (!username) return;

			io.emit('chat message', {
				'username': username,
				'msg': mes
			});
		})

		sock.on('disconnect', ()=>{
			if (username)
			{
				io.emit('user exit', username);
				
				userArr.slice(userArr.indexOf(userMap[username]), 1);
				delete userMap[username];
			}
			
			console.log('client disconnect');
		})
	});

	io.on('error', (err)=>{
		console.log('error: '+err);
	});

	io.on('disconnect', (err)=>{
		console.log('disconnect: '+err);
	});

	return server;
}

module.exports = init;
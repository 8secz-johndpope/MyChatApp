module.exports = function(http, database = require('../connect-mongo')())
{	
	const io = require('socket.io')(http);
	let userArr = [];
	const userActive = {};

	io.on('connect', (sock)=>{
		const username = sock.handshake.session.user;

		userActive[username] = sock;
		UpdateUserList();

		sock.on('chat to', async (data)=>{
			const othername = data.username;
			const msg = data.msg;
			const imgs = data.imgs;
			const time = new Date().getTime();

			const dataSend = {
				username: username,
				msg: data.msg,
				imgs: data.imgs
			}

			if (userActive[othername]) {
				userActive[othername].emit('receive chat', dataSend)
			}
			if (othername != username) sock.emit('receive chat', dataSend);

			const db = await database.ready();
			db.collection('Chat').insertOne({
				user_send: (username),
				user_read: (othername),
				msg: msg,
				imgs: data.imgs,
				time: time
			});
		})

		sock.on('get msg with', async (data)=>{
			const othername = data.username;
			const offset = data.offset;
			const limit = data.limit;
			const type = (data.type == -1) ? -1 : 1; // -1: older,  1: newer
			const db = await database.ready();
			const dataSend = {
				type: type,
				arrMsg: []
			}

			const arrMsg = await db.collection('Chat').find({
				$or: [
					{$and: [{user_send: username, user_read: othername}]},
					{$and: [{user_send: othername, user_read: username}]},
				]
			}).sort({time: -1}).skip(offset).limit(limit).toArray();

			dataSend.arrMsg = arrMsg.sort((a, b)=>{
				return (a.time - b.time)*type;
			});

			sock.emit('res msg with', dataSend);
		})

		sock.on('disconnect', (why)=>{
			UpdateUserList();
			delete userActive[username];
		});
	});

	async function UpdateUserList()
	{
		const db = await database.ready();
		
		db.collection('User').find({}, {fields: {_id: 0}}).toArray((err, arr)=>{

			if (err) {
				io.sockets.emit('update user list', {err: true, msg: 'Query failed'});
				return;
			}

			userArr = arr;
			for (let i = 0, len = userArr.length; i < len; ++i)
			{
				const user = userArr[i];
				if (!userActive[user.name]) {
					userArr[i]['status'] = 'offline';
				}
				else {
					userArr[i]['status'] = 'active';
				}
			}

			io.sockets.emit('update user list', {
				err: false,
				arr: userArr
			})
		});
	}

	return io;
}


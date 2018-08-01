/**
 * 
 * @param {SocketIO} io 
 */
function Chat (main) {
	this.io = main.io
	this.database = main.database
	this.storage = main.storage
	this.userArr = main.userArr
	this.userActive = main.userActive
	this.notify = require('../notification')(main.database)

	this.io.on('connect', (sock) => {
		this.sendMessageHandle(sock)
		this.chatHistoryHandle(sock)
	})
}

/**
 * handle function for send messsage
 * @param {socket} sock socket of socket.io
 */
Chat.prototype.sendMessageHandle = function (sock) {
	sock.on('chat to', async (data) => {
		const username = sock.handshake.session.user
		const othername = data.username
		
		const msg = data.msg
		const imgs = data.imgs ? data.imgs : null
		const time = new Date().getTime()
		let imgsAfterStore
		if (imgs) imgsAfterStore = await this.uploadImgs(imgs)
		else imgsAfterStore = []

		const dataSend = {
			username: username,
			msg: msg,
			imgs: imgsAfterStore
		}

		if (this.userActive[othername]) {
			this.userActive[othername].emit('receive chat', dataSend)
		}
		if (othername !== username) sock.emit('receive chat', dataSend)

		// add to notify
		this.notify.add({
			user: othername,
			type: 'chat message'
		})

		const db = await this.database.ready()
		db.collection('Chat').insertOne({
			user_send: (username),
			user_read: (othername),
			msg: msg,
			imgs: imgsAfterStore,
			time: time
		})
	})
}

Chat.prototype.chatHistoryHandle = function (sock) {
	sock.on('get msg with', async (data) => {
		const username = sock.handshake.session.user
		const othername = data.username
		const offset = data.offset
		const limit = data.limit
		const type = (data.type === -1) ? -1 : 1 // -1: older,  1: newer
		const db = await this.database.ready()
		const dataSend = {
			type: type,
			arrMsg: []
		}

		const arrMsg = await db.collection('Chat').find({
			$or: [
				{$and: [{user_send: username, user_read: othername}]},
				{$and: [{user_send: othername, user_read: username}]}
			]
		}).sort({time: -1}).skip(offset).limit(limit).toArray()

		dataSend.arrMsg = arrMsg.sort((a, b) => {
			return (a.time - b.time) * type
		})

		sock.emit('res msg with', dataSend)
	})
}

/**
 * store images base64 list and return list of id
 * @param {Array} imgs array of base64 image data
 * @returns list of images's id
 */
Chat.prototype.uploadImgs = async function (imgs) {
	const arrayId = []

	try {
		for (const img of Array.from(imgs)) {
			const binData = Buffer.from(img.base64Data, 'base64')
			const id = await this.storage.addImage(binData)
			arrayId.push(id)
		}
	} catch (err) {
		console.log("Error: " + JSON.stringify(err, null, 4))
	}

	return arrayId
}

module.exports = function (main) {
	return new Chat(main)
}

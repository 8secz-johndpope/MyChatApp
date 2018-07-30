/**
 * 
 * @param {SocketIO} io 
 */
function Chat (io, main) {
	this.io = io
	this.main = main

	io.on('connect', (sock) => {
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
		const imgsAfterStore = imgs ? await this.uploadImgs(imgs) : []

		const dataSend = {
			username: username,
			msg: msg,
			imgs: imgsAfterStore
		}

		if (this.main.userActive[othername]) {
			this.main.userActive[othername].emit('receive chat', dataSend)
		}
		if (othername !== username) sock.emit('receive chat', dataSend)

		const db = await this.main.database.ready()
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
		const db = await this.main.database.ready()
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

	for (const img of Array.from(imgs)) {
		const binData = Buffer.from(img.base64Data, 'base64')
		const id = await this.main.storage.addImage(binData)
		arrayId.push(id)
	}

	return arrayId
}

module.exports = Chat 

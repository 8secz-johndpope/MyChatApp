// module of other works
const ChatHandle = require('./chat')
const AccessHandle = require('./access')

const Socket = function (http, database, storage) {	
	if (!database) throw new Error('Missing parameter database')
	const io = require('socket.io')(http)

	this.database = database
	this.storage = storage
	this.userArr = []
	this.userActive = {}
	
	const access = new AccessHandle(io, this)
	const chat = new ChatHandle(io, this)

	return io
}

module.exports = Socket

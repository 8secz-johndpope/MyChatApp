// module of other works
const ChatHandle = require('./chat')
const AccessHandle = require('./access')

/**
 * handle socket io
 * @module Socket
 * @param {*} http http server object
 * @param {*} database Connect-Mongo Object
 * @param {*} storage StoreImage object
 */
function Socket (http, database, storage) {	
	if (!database) throw new Error('Missing parameter database')
	this.io = require('socket.io')(http)

	this.database = database
	this.storage = storage
	this.userArr = []
	this.userActive = {}
	
	AccessHandle(this)
	ChatHandle(this)

	return this.io
}

module.exports = Socket

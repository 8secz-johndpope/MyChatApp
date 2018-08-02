const NotifyObject = require('./notifyObj')
const CONFIG = require('./notify_config')

/**
 * class for handle notification
 */
function Notification (database) {
	this.database = database
}

/**
 * add notify object to database
 * @param {String} user 
 * @param {NotifyObject} notify 
 */
Notification.prototype.add = async function (notify) {
	const db = await this.database.ready()
	// validate notify
	if (!notify || !notify.user || !notify.type || !notify.content) throw new Error('missing add notify parameter')

	const res = await db.collection('Notify').insertOne({
		user: notify.user,
		type: notify.type,
		content: notify.content
	})

	return !!res.result.ok
}

/**
 * 
 * @param {String} user 
 * @param {Number} [limit] 
 * @param {Number} [offset] 
 * @param {String} [type] 
 */
Notification.prototype.get = async function (user, limit, offset, type) {
	if (!user) throw new Error('Param user undefined')

	if (!limit) limit = CONFIG.NOTIFY_GET_LIMIT
	if (!offset) offset = CONFIG.NOTIFY_GET_OFFSET
	if (!type) type = /.*/
	const db = await this.database.ready()
	
	const arrayRes = await db.collection('Notify').find({
		type: type,
		user: user
	}, {fields: {_id: 0}}).skip(offset)
	.limit(limit)
	.toArray()

	return arrayRes
}

module.exports = function (database) {
	return new Notification(database)
}

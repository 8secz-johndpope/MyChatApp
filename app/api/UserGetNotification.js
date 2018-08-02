const router = require('express').Router()
const returner = require('./ApiReturn')
const Notification = require('../notification')

module.exports = function (database, StoreImage) {
	const notify = Notification(database)

	router.get('/api/notification', async (req, res) => {
		const db = await database.ready()
		const user = req.session.user

		const offset = +req.query.offset // still work with undefined
		const limit = +req.query.limit // too

		try {
			const arrResult = await notify.get(user, limit, offset)
			res.end(returner.success(arrResult))
		} catch (err) {
			res.end(returner.error(err))
		}
	})

	return router
}

'use strict'

const api = require('express').Router()
const returner = require('./ApiReturn')

/**
 * @param {Object} Store
 * @param {Object} database require('connect-mongo')()
 */
function init (database, Store) {
	api.use(require('./UserCoverPhoto')(database, Store))
	api.use(require('./UserAvatar')(database, Store))
	api.use(require('./UserGetNotification')(database, Store))
	
	api.get('/api/user/:username', async (req, res, next) => {
		try {
			const username = req.params.username
			const db = await database.ready()
			const arrMatch = await db.collection('User').find({name: username}).toArray()

			if (arrMatch.length === 0) {
				throw new Error('Khong tim thay user ' + username)
			}

			res.end(returner.success({
				username: arrMatch[0].name,
				picture: arrMatch[0].picture,
				cover_image: arrMatch[0].cover_image
			}))
		} catch (e) {
			console.log(e)
			res.end(returner.error(e))
		}
	})

	api.get('/api/me', async (req, res) => {
		try {
			const username = req.session.user
			const db = await database.ready()
			const arrMatch = await db.collection('User').find({name: username}).toArray()

			if (arrMatch.length === 0) {
				throw new Error('Khong tim thay ' + username + ' in ' + req.url)
			}

			res.end(returner.success({
				username: arrMatch[0].name,
				picture: arrMatch[0].picture,
				cover_image: arrMatch[0].cover_image
			}))
		} catch (e) {
			console.log(e)
			res.end(returner.error(e))
		}
	})

	return api
}

module.exports = init

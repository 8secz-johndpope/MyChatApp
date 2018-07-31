'use strict'

const router = require('express').Router()
const returner = require('./ApiReturn')

module.exports = function (database, Store) {
	router.post('/api/user/avatar', async (req, res) => {
		if (!req.session || !req.session.user) {
			res.send(returner.error('Missing Credentials'))
			return
		}
		if (!req.files || !req.files.avatar) {
			res.send(returner.error('Missing File'))
			return
		}

		const username = req.session.user
		const file = req.files.avatar
		const db = await database.ready()

		const idImage = await Store.addImage(file.data)
		const imagePath = await Store.getImageUrl(idImage)

		db.collection('User')
		.update({name: username}, {$set: {picture: imagePath}}, (err) => {
			if (err) {
				res.send(returner.error('Cannot add to database: ' + err))
				return
			}
			res.send(returner.success({new_picture_url: imagePath}))
		})
	})

	return router
}

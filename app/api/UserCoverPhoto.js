'use strict'

const router = require('express').Router()
const returner = require('./ApiReturn')

module.exports = function (database, Store) {
	router.post('/api/user/cover-photo', async (req, res) => {
		if (!req.session || !req.session.user) {
			res.send(returner.error("Missing Credentials"))
			return
		}
		if (!req.files || !req.files.cover) {
			res.send(returner.error("Missing File"))
			return
		}

		const username = req.session.user
		const file = req.files.cover
		const db = await database.ready()

		const idImage = await Store.addImage(file.data, {width: 768, quality: 100})
		const imagePath = await Store.getImageUrl(idImage)

		db.collection('User')
		.update({name: username}, {$set: {cover_image: imagePath}}, (err) => {
			if (err) {
				res.send(returner.error('Cannot add to database: ' + err))
				return
			}
			res.send(returner.success({
				new_cover_url: imagePath
			}))
		})
	})

	return router
}

'use strict'

const router = require('express').Router()
const returner = require('./ApiReturn')

module.exports = function (database, Store) {
	router.post('/api/user/avatar', async (req, res) => {
		if (!req.session || !req.session.user) {
			res.end(returner.error('Missing Credentials'))
			return
		}
		if (!req.files || !req.files.avatar) {
			res.end(returner.error('Missing File'))
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
				res.end(returner.error('Cannot add to database: ' + err))
				return
			}
			res.end(returner.success({new_picture_url: imagePath}))
		})
	})

	router.get('/:username/avatar', async (req, res) => {
		const username = req.params.username;

		const db = await database.ready();
		const findArr = await db.collection('User').find({name: username}).toArray();
		if (findArr.length === 0) {
			res.status(404).send('Not Found');
			return;
		}

		const picturePath = findArr[0].picture;
		res.redirect(picturePath + '?width=100&height=100');
	})

	return router
}

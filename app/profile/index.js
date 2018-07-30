'use strict'

module.exports = function (database = require('../connect-mongo')()) {
	const profile = require('express').Router()
	const myFunc = require('../../myFunc')(database)

	profile.get('/profile/:username', myFunc.checkSession(async (req, res) => {
		try {
			const username = req.params.username
			const userInfo = await myFunc.getUserInfo(username)
			const myInfo = req.user_info

			res.render('profile', {
				me: myInfo,
				user: userInfo
			})
		} catch (e) {
			res.status(500).send(e + "")
		}
	}))

	profile.get('/profile', myFunc.checkSession((req, res) => {
		res.redirect('/profile/' + req.user_info.name)
	}))

	return profile
}

const app = require('express').Router()

function init (database, storage) {
	const myFunc = require('../myFunc')(database)

	app.get('/', async (req, res) => {
		if (!req.session || !req.session.user) {
			res.redirect('/login')
			return
		}
		const userInfo = await myFunc.getUserInfo(req.session.user) 
	
		res.render('home', {user: userInfo})
	})
	
	// middleware
	app.use(storage.static())
	app.use(require('./login')(database))
	app.use(require('./chat')(database))
	app.use(require('./api')(database, storage))
	app.use(require('./profile')(database))	

	// 404
	app.use(async (req, res, next) => {
		res.status(404)
		
		if (req.accepts('html')) {
			let user
			if (req.session && req.session.user) {
				user = await myFunc.getUserInfo(req.session.user) 
			}
			res.render('404', {url: req.url, user: user})
		} else if (req.accepts('json')) {
			res.end(JSON.stringify({
				err: true,
				msg: '404 Not found'
			}))
		} else {
			res.end('404 Not found')
		}
	})

	return app
}

module.exports = init

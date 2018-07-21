'use strict';

const express 	= require('express');
const route		= express.Router();

//index
route.get('/', (req, res)=>{
	if (req.session && req.session.sid)
	{
		if (req.session.sid == "asd")
		{
			const user = {
				avatar_src: '/image/test.png',
				name: 'Admin',
				liked: 100
			}
			res.render('home', {user: user});
		}
			

		return;
	}

	res.render('intro');
});
//login page
route.get('/login', (req, res)=>{
	if (req.session.sid == 'asd') {
		res.redirect('/');
	}

	res.render('login', {err: undefined});
})

route.post('/login', (req, res)=>{
	const username = req.body.username;
	const password = req.body.password;

	if (username == 'admin' && password == 'admin')
	{
		req.session.sid = 'asd';
		res.redirect('/');
	}
	else {
		res.render('login', {err: 'login failed'})
	}
})

route.get('/logout', (req, res)=>{
	req.session.destroy();
	res.redirect('/login');
})

route.get('/signup', (req, res)=>{
	res.render('signup', {err: false});
});

route.post('/signup', (req, res)=>{
	const username = req.body.username;
	const password = req.body.password;

	res.redirect('/');
})

//handle 404
route.use(function(req, res, next){
	res.status(404);

	// respond with html page
	if (req.accepts('html')) {
		res.render('404', { url: req.url });
		return;
	}

	// respond with json
	if (req.accepts('json')) {
		res.send({ error: 'Not found' });
		return;
	}

	// default to plain-text. send()
	res.type('txt').send('Not found');
});

module.exports = route;
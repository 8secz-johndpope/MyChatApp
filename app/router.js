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

	res.redirect('/login');
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

module.exports = route;
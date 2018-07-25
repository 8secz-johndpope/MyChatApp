const chat = require('express').Router();
const myFunc = require('../../myFunc');

chat.get('/chat/:username', async (req , res )=>{
	if (!req.session || !req.session.user)
	{
		res.redirect('/login');
		return;
	}
	const othername = req.params.username;
	const user_info = await myFunc.getUserInfo(req.session.user);
	res.render('chat', {username: othername, user: user_info});
});

module.exports = chat;
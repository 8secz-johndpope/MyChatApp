module.exports = function(database)
{
	const chat = require('express').Router();
	const myFunc = require('../../myFunc')(database);

	chat.get('/chat/:username', myFunc.checkSession((req, res)=>{
		const othername = req.params.username;
		const user_info = req.user_info;
		res.render('chat', {username: othername, user: user_info});
	}))

	return chat;
}
const profile = require('express').Router();
const myFunc = require('../../myFunc');

profile.get('/profile/:username', async (req, res)=>{
	if (!req.session || !req.session.user)
	{
		res.redirect('/login');
		return;
	}

	try {
		const username = req.params.username;
		const userInfo = await myFunc.getUserInfo(username);
		const myInfo = await myFunc.getUserInfo(req.session.user);

		res.render('profile', {me: myInfo, user: userInfo});
	}
	catch(e)
	{
		res.status(500).send(e+"");
	}
});

profile.get('/profile', (req, res)=>{
	if (!req.session || !req.session.user)
	{
		res.redirect('/login');
		return;
	}

	res.redirect('/profile/'+req.session.user);
});

module.exports = profile;
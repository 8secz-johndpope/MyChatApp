module.exports = function(database = require('../app/connect-mongo')())
{
	this.getUserInfo = async function (username)
	{
		const db = await database.ready();
		const info = await db.collection('User').find({name: username}).toArray();

		if (info.length == 0) {
			return {
				name: null,
				picture: null
			}
		}

		return {
			name: info[0].name,
			picture: info[0].picture,
			cover_image: info[0].cover_image
		}
	},

	this.checkSession = function (success = (req, res)=>any) {
		return async function(req, res, next)
		{
			if (!req.session || !req.session.user)
			{
				res.redirect('/login');
				return;
			}
			
			const db = await database.ready();
			const match = await db.collection('User').find({name: req.session.user}).toArray();

			if (match.length > 0)
			{
				req.user_info = match[0];
				success(req, res, next);
			}
			else {
				req.session = null;
				res.redirect('login');
			}
		}
	}

	return this;
}
module.exports = {
	database : require('../app/connect-mongo')(),

	getUserInfo: async function (username)
	{
		const db = await this.database.ready();
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

	checkSession: async function (req, res, next) {
		if (!req.session || !req.session.user)
		{
			res.redirect('/login');
			next();
		}
	}
}
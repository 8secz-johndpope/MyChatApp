const api = require('express').Router();
const database = require('../connect-mongo')();
const mime = require('mime-types');
const fileupload = require('express-fileupload');

api.use(fileupload());

api.get('/api/user/:username', async(req , res)=>{
	// res.header({'Content-Type': 'application/json'});
	const username = req.params.username;
	try {
		const db = await database.ready();
		const arrMatch = await db.collection('User').find({name: username}).toArray();

		if (arrMatch.length == 0) {
			throw 'Khong tim thay '+username;
		}

		res.end(JSON.stringify({
			err: false,
			data: {
				username: arrMatch[0].name,
				picture: arrMatch[0].picture,
				cover_image: arrMatch[0].cover_image
			}
		}));
	}
	catch(e)
	{
		console.log(e+"");
		res.end(JSON.stringify({
			err: true,
			msg: err
		}))
	}
});

api.get('/api/me', async (req, res)=>{
	const username = req.session.user;

	try {
		const db = await database.ready();
		const arrMatch = await db.collection('User').find({name: username}).toArray();

		if (arrMatch.length == 0) {
			throw 'Khong tim thay '+username+' in '+req.url;
		}

		res.end(JSON.stringify({
			err: false,
			data: {
				username: arrMatch[0].name,
				picture: arrMatch[0].picture,
				cover_image: arrMatch[0].cover_image
			}
		}));
	}
	catch(e)
	{
		console.log(e+"");
		res.end(JSON.stringify({
			err: true,
			msg: err
		}))
	}
})

api.post('/api/user/avatar', async (req, res)=>{

	if (!req.session || !req.session.user) {
		res.send(JSON.stringify({
			err: true,
			msg: 'missing credentials'
		}))
		return;
	}
	const username = req.session.user;

	if (!req.files || !req.files.avatar)
	{
		res.send(JSON.stringify({
			err: true,
			msg: 'missing file'
		}))
		return;
	}

	const file = req.files.avatar;
	const newName = username+'.'+mime.getExtension(file.mimetype);
	
	const db = await database.ready();
	file.mv(__dirname + '../../public/avatar/'+newName , (err)=>{
		if (err) {
			res.send(JSON.stringify({
				err: true,
				msg: 'cannot upload file'
			}))
			return;
		}

		db.collection('User').update({name: username},
		{$set: {picture: '/avatar/'+newName}},
		(err)=>{
			if (err) {
				res.send(JSON.stringify({
					err: true,
					msg: 'cannot update on user infomation'
				}))
				return;
			}

			res.send(JSON.stringify({
				err: false,
				new_picture_url: '/avatar/'+newName
			}))
			return;
		});
	});
});

module.exports = api;
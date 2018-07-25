const login = require('express').Router();
const database = require('../connect-mongo')();
const bcrypt = require('bcrypt');
const mime = require('mime-types');
const StoreImage = require('../store-image');
const store = new StoreImage();

const SALT_ROUND = 10;

login.get('/signup', (req, res)=>{
	if (req.session && req.session.user) {
		res.redirect('/');
	}

	res.render('signup', { msg: null });
})

login.post('/signup', async (req, res)=>{
	const username = req.body.username;
	const password = req.body.password;

	//check username
	if (!username.match(/^[a-zA-Z_0-9]+$/)) {
		res.render('signup', {msg: 'Invalid username'});
		return;
	}

	const picture = req.files.picture;
	const newPicName = username + '.jpeg'; //with StoreImage(sharp)- always to Jpeg
	const db = await database.ready();

	const arrayMatch = await db.collection('User')
						.find({name: new RegExp(`^${username}$`, 'i')})
						.toArray();

	
	if (arrayMatch.length > 0) {
		res.render('signup', {msg: 'User exists'});
		return;
	}

	await store.add(picture.data);
	store.save(__dirname + '/../../public/avatar/' + newPicName, (err)=>{
		if (err) {
			res.render('signup', {msg: err+""});
			return;
		}

		const hash = bcrypt.hashSync(password, SALT_ROUND);

		db.collection('User').insertOne({
			name: username,
			passhash: hash,
			picture: `/avatar/${newPicName}`,
			cover_image: '/images/default_cover.jpg'
		}, (err)=>{
			if (err) {
				res.render('signup', {msg: err + ''});
				return;
			}
			req.session.user = username;
			// req.session.save();
			res.redirect('/');
		});

	});
})


login.get('/login', (req, res)=>{
	if (req.session && req.session.user)
	{
		res.redirect('/');
	}
	else
	{
		res.render('login', {msg: null});
	}
});

login.post('/login', async (req, res)=>{
	const username = req.body.username;
	const password = req.body.password;

	const db = await database.ready();
	const match = await db.collection('User').find({name: username}).toArray();
	if (!match || match.length == 0) {
		done(null, false, {message: 'Login failed'});
		return;
	}

	const user = match[0];
	const same = await bcrypt.compare(password, user.passhash);
		
	if (same) {
		req.session.user = user.name;
		req.session.save();

		res.redirect('/');
		return;
	}
	else {
		res.render('login', {msg: 'Login failed'});
	}
});

login.get('/logout', (req, res)=>{
	req.session = null;
	res.redirect('/login');
})

module.exports = login;
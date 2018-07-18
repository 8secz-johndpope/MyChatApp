const express = require('express');
const session = require('express-session');
const bodyparser = require('body-parser');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const db = require('mongodb');

http.listen(80, ()=>{
	console.log('Server is listen on port 80');
});

app.use(express.static(__dirname + '/public'));

//library
app.use('/socketio', express.static(__dirname + '/node_modules/socket.io-client/dist'));
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist'))
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({extended: true}))
app.set('view engine', 'ejs');

//session
app.use(session({
	secret: "bethany",
	cookie: {
		"maxAge": 3600*24*30
	}
}))

//index
app.get('/', (req, res)=>{
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
app.get('/login', (req, res)=>{
	if (req.session.sid == 'asd') {
		res.redirect('/');
	}

	res.render('login', {err: undefined});
})
app.post('/login', (req, res)=>{
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

//socket io

io.on('connection', (sock)=>{
	console.log('client connect');

	sock.on('chat message', (mes)=>{
		io.emit('chat message', mes);
	});

	sock.on('disconnect', ()=>{
		console.log('client disconnect');
	})
});

io.on('error', (err)=>{
	console.log('error: '+err);
});

io.on('disconnect', (err)=>{
	console.log('disconnect: '+err);
});
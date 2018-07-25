const express = require('express');
const app = express();
const http = require('http').Server(app);
const bodyParser = require('body-parser');
const myFunc = require('./myFunc');
const session = require('./app/session');
const sharedsession = require('express-socket.io-session')(session);

const ConnectMongo = require('./app/connect-mongo');
const database = new ConnectMongo();
const PORT = process.env.PORT || 80;

database.ready(async (db)=>{
	console.log('Database is ready');

	const matchUserCol = await db.listCollections({name: 'User'}).toArray()
	const matchChatCol = await db.listCollections({name: 'Chat'}).toArray()
	
	if (matchUserCol.length > 0) {
		console.log('Database: User exists, skip');
	}
	else {
		console.log('Database: User not exist, wait for create...');
		db.createCollection('User', (err)=>{
			if (err) throw err;
			console.log('Database: User created');
		});
	}

	if (matchChatCol.length > 0)
	{
		console.log('Database: Chat exists, skip');
	}
	else {
		console.log('Database: Chat not exist, wait for create...');
		db.createCollection('Chat', (err)=>{
			if (err) throw err;
			console.log('Database: Chat created');
		});
	}
})


//server
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(session);

//library for client
app.use('/lib/socket.io', express.static(__dirname + '/../node_modules/socket.io-client/dist'));

//app router
app.use(require('./app'));

//io
const ioServer = require('./app/socket')(http);
//share session with socket-io
ioServer.use(sharedsession);

//listen
http.listen(PORT, ()=>{
	console.log('Server listen on http://localhost:' + PORT + '/');
	console.log('Wait for database...');
})
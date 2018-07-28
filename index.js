const express = require('express');
const app = express();
const http = require('http').Server(app);
const bodyParser = require('body-parser');
const myFunc = require('./myFunc');
const session = require('./app/session');
const sharedsession = require('express-socket.io-session')(session);
const fileupload = require('express-fileupload');

const database = require('./app/connect-mongo');
const PORT = process.env.PORT || 80;

const Logger = require('./app/logging');



//server
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json({
	limit: "5mb"
}));
app.use(bodyParser.urlencoded({
	limit: '5mb',
	extended: true
}));
app.use(fileupload());
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(session);

//library for client
app.use('/lib/socket.io', express.static(__dirname + '/node_modules/socket.io-client/dist'));

//app router
app.use(require('./app/index')(database));

//io
const ioServer = require('./app/socket')(http, database);
//share session with socket-io
ioServer.use(sharedsession);


database.ready(async (db)=>{
	const matchUserCol = await db.listCollections({name: 'User'}).toArray()
	const matchChatCol = await db.listCollections({name: 'Chat'}).toArray()
	
	if (matchUserCol.length > 0) {
		Logger.log('info', 'User exists, skip..')
	}
	else {
		Logger.log('info', 'User Collection not exist, wait for create...');
		db.createCollection('User', (err)=>{
			if (err) throw err;
			Logger.log('info', 'User Collection created');
		});
	}

	if (matchChatCol.length > 0)
	{
		Logger.log('info', 'Chat Collection exists, skip');
	}
	else {
		Logger.log('info', 'Chat Collection not exist, wait for create...');
		db.createCollection('Chat', (err)=>{
			if (err) throw err;
			Logger.log('info', 'Chat Collection created');
		});
	}

	//listen
	http.listen(PORT, ()=>{
		console.log('Server listen on http://localhost:' + PORT + '/');
		console.log('Start...');
	})
})



process.on('unhandledRejection', (reject)=>{
	Logger.warn(reject + '');
})
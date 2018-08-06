const express = require('express');
const app = express();
const http = require('http').Server(app);
const bodyParser = require('body-parser');
const session = require('./app/session');
const sharedsession = require('express-socket.io-session')(session);
const fileupload = require('express-fileupload');
const path = require('path');

const database = require('./app/connect-mongo');
const storage = require('./app/StoreImage');
const PORT = process.env.PORT || 80;

const Logger = require('./app/logging');

// server
app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({extended: true, limit: '50mb'}));
app.use(fileupload());
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');
app.use(session);

// library for client
app.use('/lib/socket.io', express.static(path.join(__dirname, '/node_modules/socket.io-client/dist')));

// app router
app.use(require('./app/index')(database, storage));

database.ready(async (db) => {
	// init storage
	await storage.init();

	const matchUserCol = await db.listCollections({name: 'User'}).toArray();
	const matchChatCol = await db.listCollections({name: 'Chat'}).toArray();
	const matchNotifyCol = await db.listCollections({name: 'Notify'}).toArray();
	
	if (matchUserCol.length > 0) {
		Logger.log('info', 'User exists, skip..');
	} else {
		Logger.log('info', 'User Collection not exist, wait for create...');
		db.createCollection('User', (err) => {
			if (err) throw err;
			Logger.log('info', 'User Collection created');
		});
	}

	if (matchChatCol.length > 0) {
		Logger.log('info', 'Chat Collection exists, skip');
	} else {
		Logger.log('info', 'Chat Collection not exist, wait for create...');
		db.createCollection('Chat', (err) => {
			if (err) throw err;
			Logger.log('info', 'Chat Collection created');
		});
	}

	if (matchNotifyCol.length > 0) {
		Logger.log('info', 'Notify Collection exists, skip');
	} else {
		Logger.log('info', 'Notify Collection not exist, wait for create...');
		db.createCollection('Notify', (err) => {
			if (err) throw err;
			Logger.log('info', 'Notify Collection created');
		});
	}

	// io
	const ioServer = require('./app/socket')(http, database, storage);
	ioServer.use(sharedsession);

	// listen
	http.listen(PORT, () => {
		Logger.info('NODE_ENV: ' + process.env.NODE_ENV);
		console.log('Server listen on http://localhost:' + PORT + '/');
		console.log('Start...');
	});
});

process.on('unhandledRejection', (reject) => {
	console.log(reject);
});

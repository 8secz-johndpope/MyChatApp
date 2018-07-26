const express = require('express');
const app = express();
const http = require('http').Server(app);
const bodyParser = require('body-parser');
const myFunc = require('./myFunc');
const session = require('./app/session');
const sharedsession = require('express-socket.io-session')(session);
const fileupload = require('express-fileupload');

const ConnectMongo = require('./app/connect-mongo');
const database = new ConnectMongo();
const PORT = process.env.PORT || 80;

function myLog(name, str)
{
	console.log('\x1b[36m%s\x1b[0m: %s', name, str);
}

database.ready(async (db)=>{
	const matchUserCol = await db.listCollections({name: 'User'}).toArray()
	const matchChatCol = await db.listCollections({name: 'Chat'}).toArray()
	
	if (matchUserCol.length > 0) {
		myLog('Database', 'User exists, skip..')
	}
	else {
		myLog('Database', 'User Collection not exist, wait for create...');
		db.createCollection('User', (err)=>{
			if (err) throw err;
			myLog('Database', 'User Collection created');
		});
	}

	if (matchChatCol.length > 0)
	{
		myLog('Database', 'Chat Collection exists, skip');
	}
	else {
		myLog('Database', 'Chat Collection not exist, wait for create...');
		db.createCollection('Chat', (err)=>{
			if (err) throw err;
			myLog('Database', 'Chat Collection created');
		});
	}
})


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
app.use(require('./app')(database));

//io
const ioServer = require('./app/socket')(http, database);
//share session with socket-io
ioServer.use(sharedsession);

//listen
http.listen(PORT, ()=>{
	console.log('Server listen on http://localhost:' + PORT + '/');
	console.log('Wait for database...');
})

process.on('unhandledRejection', function(err){
	console.log('\x1b[35m%s:\x1b[0m %s', 'Error', err + "");
	throw err;
});
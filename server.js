const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

http.listen(80, ()=>{
	console.log('Server is listen on port 80');
});

app.use(express.static(__dirname + '/public'));

//library
app.use('/socketio', express.static(__dirname + '/node_modules/socket.io-client/dist'));
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist'))


//index
app.get('/', (req, res)=>{
	res.sendFile(__dirname + '/index.html');
});

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
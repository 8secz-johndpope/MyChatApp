const express = require('express');
const session = require('express-session');
const bodyparser = require('body-parser');
const app = express();
const path = require('path');

const PORT = process.env.PORT || 80;

app.use(express.static(__dirname + '/public'))

//library
app.use('/socketio', express.static(path.join(__dirname, '/node_modules/socket.io-client/dist')))
app.use('/jquery', express.static(path.join(__dirname, '/node_modules/jquery/dist')))
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({extended: true}))
app.set('views', path.join(__dirname, '/views'))
app.set('view engine', 'ejs');

//session
app.use(session({
	secret: "this is a secret",
	resave: true,
	saveUninitialized: true,
	cookie: {
		"maxAge": 3600*24*30
	}
}))

//handle request
app.use('/', require('./app/router'))

//socket io

require('./app/socketio')(app).listen(PORT, ()=>{
	console.log('Server is listening on '+PORT);
})
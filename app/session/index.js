const session = require('cookie-session');
const config = require('../../config.json');

module.exports = session({
	name: 'session',
	keys: config.keys,
	path: '/'
})
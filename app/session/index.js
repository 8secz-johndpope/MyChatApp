const session = require('cookie-session')
const config = require('../../config')
let keys

if (process.env.NODE_ENV === 'production') {
	keys = JSON.parse(process.env['session_secret_key'])
} else {
	keys = config.keys
}

module.exports = session({
	name: 'session',
	keys: keys,
	path: '/'
})

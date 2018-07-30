const google = require('googleapis').google
const path = require('path')

// the file must be hide on open source repos
const LOCAL_SERVICE_PATH = path.join(__dirname, './service_config.hide.json')

const SERVICE_CONFIG = (process.env.NODE_ENV === 'production')
						? JSON.parse(process.env.google_service_config) // config env on server
						: require(LOCAL_SERVICE_PATH) // local file

const JwtAuth = new google.auth.JWT(
	SERVICE_CONFIG.client_email,
	null,
	SERVICE_CONFIG.private_key,
	[ // scopes
		"https://www.googleapis.com/auth/photoslibrary",
		"https://www.googleapis.com/auth/photoslibrary.sharing"
	]
)

module.exports = {
	auth: JwtAuth,
	getToken: async () => {
		const res = await JwtAuth.authorize()
		return res.access_token
	}
}

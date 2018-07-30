const path = require('path')

module.exports = {
	keys: [
		"this_is_just_for_local",
		"in_server_i_will_config_to_env"
	],

	LOCAL_DATABASE_URL: "mongodb://127.0.0.1:27017/chatApp",
	
	HASH: {
		SALT_ROUND: 10
	},
	
	LocalStorage: path.join(__dirname, "/store_folder")
}

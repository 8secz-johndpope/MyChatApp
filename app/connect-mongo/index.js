const config = require('../../config')
const URL = require('url')
let DB_URL
let DB_NAME

if (process.env.NODE_ENV === 'production') {
	DB_URL = process.env['mlab_mongo_url']
} else {
	DB_URL = config.LOCAL_DATABASE_URL
}

DB_NAME = URL.parse(DB_URL).path.replace('/', '')

function ConnectMongo () {
	this.db = null
	this.dbo = null
	console.log('\x1b[36m%s\x1b[0m: %s', 'Database', 'Connect to ' + DB_URL)
}

ConnectMongo.prototype.ready = async function (callback) {
	if (this.db) return this.db
	const MongoClient = require('mongodb').MongoClient
	const dbo = await MongoClient.connect(DB_URL, {useNewUrlParser: true})
	
	this.db = dbo.db(DB_NAME)
	this.dbo = dbo

	if (typeof callback === 'function') callback(this.db)
	return this.db
}

ConnectMongo.prototype.close = function () {
	this.ready().then(() => {
		this.dbo.close()
	})
}

module.exports = new ConnectMongo()

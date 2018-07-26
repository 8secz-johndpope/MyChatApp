const config = require('../../config.json');
const URL = require('url');

module.exports = function()
{
	this.db = null;

	const path = URL.parse(config.DATABASE_URL);
	const dbname = path.pathname.replace('/','');
	const url = `mongodb://${path.hostname}:${path.port}/${dbname}`;

	console.log('\x1b[36m', 'Database:', '\x1b[0m', ' Connect to '+url);

	this.ready = async function (callback)
	{
		if (this.db) return this.db;

		const MongoClient = require('mongodb').MongoClient;
		const dbo = await MongoClient.connect(url, {useNewUrlParser: true});
		this.db = dbo.db(dbname);
		if (typeof callback == 'function') callback(this.db);
		return this.db;
	}

	return this;
}
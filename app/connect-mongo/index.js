module.exports = function()
{
	this.db = null;
	this.url = 'mongodb://127.0.0.1:27017/learn3';

	this.ready = async function (callback)
	{
		if (this.db) return this.db;

		const MongoClient = require('mongodb').MongoClient;
		const dbo = await MongoClient.connect(this.url, {useNewUrlParser: true});
		this.db = dbo.db('learn3');
		if (typeof callback == 'function') callback(this.db);
		return this.db;
	}

	return this;
}
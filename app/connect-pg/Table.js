const Query = require('./Query');

module.exports = function (db)
{
	return {
		User: new Query('chatapp_user', db),
		Chat: new Query('chatapp_chat', db)
	}
}
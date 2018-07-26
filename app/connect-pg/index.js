const url = require('url');
const {Pool} = require('pg');
let DB_URL;
let DB_NAME;

if (process.env.NODE_ENV === 'production')
{
	DB_URL = process.env.DATABASE_URL;
	DB_NAME = url.parse(DB_URL).path.replace('/', '');
}
else {
	DB_URL = "postgresql://postgres:486251793@localhost/postgres"
	DB_NAME = 'postgres';
}

const pool = new Pool({
	connectionString: DB_URL
});

async function checkTable(name)
{
	const { rows } = await pool.query(`SELECT to_regclass('${name}')`)

	if (rows.length == 0) {
		console.log('[Database]:', name + ' is not exist, wait for create...');
		return false;
	}

	console.log('[Database]:', name+' exists, skip');
	return true;
}

module.exports = {
	init: async (callback = (err)=>{})=>{
		const isUserTableExist = await checkTable('chatapp_user');
		const isChatTableExist = await checkTable('chatapp_chat');
		if (!isUserTableExist) {
			let {err} = await pool.query(`
			CREATE TABLE chatapp_user (
				username 	VARCHAR(50) PRIMARY KEY,
				picture		TEXT,
				cover_image TEXT,
				passhash	VARCHAR(61)
			)
			`).catch(err=>{
				return {
					err: err
				};
			});
			if (err) {
				callback(err);
				return err;
			}
			console.log('[Database]:', 'chatapp_user has created');
		}

		if (!isChatTableExist) {
			let {err} = await pool.query(`
			CREATE TABLE chatapp_chat (
				id			SERIAL 
				user_send 	VARCHAR(50),
				user_read 	VARCHAR(50),
				msg			TEXT,
				time		DATETIME,
				imgs		TEXT
			)
			`).catch(err=>{
				return {
					err: err
				};
			});
			if (err) {
				callback(err);
				return;
			}
			console.log('[Database]:', 'chatapp_chat has created');
		}
	},
	query: (text, params, callback)=>{
		return pool.query(text, params, callback);
	}
}
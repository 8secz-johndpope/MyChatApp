const db = require('./index');

async function init() {
	const err = await db.init();

	if (err) throw err;
}

init();
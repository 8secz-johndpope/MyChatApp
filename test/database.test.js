const database = require('../app/connect-mongo');
const assert = require('assert');

describe('Database', ()=>{
	describe('Connect', ()=>{
		it('Check connect', (done)=>{
			database.ready().then(db=>{
				assert.notEqual(undefined, db);
				database.close();
				done();
			})
		})
	})
})
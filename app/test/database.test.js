const database = require('../connect-mongo')
const assert = require('assert')

if (!process.env.is_in_travis === true) {
	describe('Database', () => {
		describe('Connect', () => {
			it('Check connect', (done) => {
				database.ready().then(db => {
					if (!db) done('null database')
					else {
						database.close()
						done()
					}
				}).catch(err => {
					done(err)
				})
			})
		})
	})
}

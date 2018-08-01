const Socket = require('../socket')
// const assert = require('assert')
const database = require('../connect-mongo')
const http = require('http').createServer()

describe('Test Socket', () => {
	describe('With No Database', () => {
		it('No database', (done) => {
			try {
				Socket(http)
				done('No throw')
			} catch (err) {
				done()
			}
		})

		it('With database', (done) => {
			try {
				Socket(http, database)
				done()
			} catch (err) {
				done(err)
			}
		})
	})
})

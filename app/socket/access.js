function Access (io, main) {
	this.io = io
	this.main = main

	io.on('connect', (sock) => {
		const username = sock.handshake.session.user

		this.main.userActive[username] = sock
		this.UpdateUserList()

		sock.on('disconnect', (why) => {
			this.UpdateUserList()
			delete this.main.userActive[username]
		})
	})
}

/**
 * update user list after every user offline or login
 * @returns `void` - but `userActive` and `userArr` will be change
 */
Access.prototype.UpdateUserList = async function () {
	const db = await this.main.database.ready()
		
	db.collection('User')
	.find({}, {fields: {_id: 0}})
	.toArray((err, arr) => {
		if (err) {
			this.io.emit('update user list', {err: true, msg: 'Query failed'})
			return
		}

		this.main.userArr = arr
		for (let i = 0, len = this.main.userArr.length; i < len; ++i) {
			const user = this.main.userArr[i]
			if (!this.main.userActive[user.name]) {
				this.main.userArr[i]['status'] = 'offline'
			} else {
				this.main.userArr[i]['status'] = 'active'
			}
		}

		this.io.emit('update user list', {
			err: false,
			arr: this.main.userArr
		})
	})
}

module.exports = Access

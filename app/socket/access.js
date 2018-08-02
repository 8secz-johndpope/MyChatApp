function Access (main) {
	this.io = main.io
	this.database = main.database
	this.storage = main.storage
	this.userArr = main.userArr
	this.userActive = main.userActive

	this.io.on('connect', (sock) => {
		const username = sock.handshake.session.user
		this.userActive[username] = sock
		this.UpdateUserList()
		
		sock.on('disconnect', (why) => {
			this.UpdateUserList()
			delete this.userActive[username]
		})
	})
}

/**
 * update user list after every user offline or login
 * @returns `void` - but `userActive` and `userArr` will be change
 */
Access.prototype.UpdateUserList = async function () {
	const db = await this.database.ready()
		
	db.collection('User')
	.find({}, {fields: {_id: 0}})
	.toArray((err, arr) => {
		if (err) {
			this.io.emit('update user list', {err: true, msg: 'Query failed'})
			return
		}

		this.userArr = arr
		for (let i = 0, len = this.userArr.length; i < len; ++i) {
			const user = this.userArr[i]
			if (!this.userActive[user.name]) {
				this.userArr[i]['status'] = 'offline'
			} else {
				this.userArr[i]['status'] = 'active'
			}
		}

		this.io.emit('update user list', {
			err: false,
			arr: this.userArr
		})
	})
}

module.exports = function (main) {
	return new Access(main)
}

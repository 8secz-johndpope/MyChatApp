module.exports = {
	success: function (data) {
		return JSON.stringify({
			err: false,
			data: data
		})
	},

	error: function (msg) {
		return JSON.stringify({
			err: true,
			msg: msg
		})
	}
}

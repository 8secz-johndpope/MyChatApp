import GetJSON from './getJson.js'

class Notification {
	constructor () {
		this.hello = 'world'
	}

	async fetch () {
		const res = await GetJSON('/api/notification?offset=0&limit=5')
		if (res.err) {
			console.log(res)
			throw new Error(res.msg)
		}
		return res.data
	}

	add (notifyObj) {
		$('#site-notify').addClass('is-notify')
		const type = notifyObj.type
		const div = this._createNotifyElement(type, notifyObj.content)
		$('#notify-list').prepend(div)
	}

	_createNotifyElement (type, content) {
		if (type === 'message') {
			const div = $('<a/>').addClass('notify-el')
			.attr('href', '/chat/' + content.user)
			.html(`
			<div class='user'>
				<div class='user-pic'>
					<img src='/${content.user}/avatar' alt='${content.user}'/>
				</div>
			</div>
			<div class='notify-el-content'>${content.user} has sent you a message</div>
			`)

			return div
		}

		return null
	}
}

export default Notification

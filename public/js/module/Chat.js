"use strict"

import GetJSON from './getJson.js'
const LIMIT_GET_MESSAGE = 5

class Chat {
    constructor () {
        this.socket = io()
        this.user = null
        this.event = {
            "recv": [],
            "send": []
        }
        // image to send
        this.arrImgsToSend = {}
        this.imgId = 0
        this.totalImgsSize = 0

        this.currentOffsetMessage = 0
        this.currentUser = ''
        this.myName = ''
    }

    async init () {
        this.user = await this._getMyInfo()
        this.myName = this.user.data.username
        this._findUserFromURL()

        this.socket.on('receive chat', (data) => {
            if (!this.event.recv) throw new Error('Event Recv not found')
            for (const callback of this.event.recv) {
                callback(data)
            }
        })

        this.socket.on('res msg with', (data) => {
            this._updateHistory(data)
        })

        this.socket.on('update user list', (data) => {
            for (const user of data.arr) {
                if (this.currentUser === user.name) {
                    if (user.status === 'active') {
                        $('#chat-user-status').addClass('text-success').text('Active now')
                    } else {
                        $('#chat-user-status').addClass('text-secondary').text('Offline')
                    }
                }
            }
        })

        // fetch history
        this.socket.emit('get msg with', {
			username: this.currentUser,
			offset: 0,
			limit: LIMIT_GET_MESSAGE,
			type: 1
		})
    }

    /**
     * 
     * @param {Function} callback (data: json)=>any 
     */
    onMessage (callback) {
        this.event['recv'].push(callback)
    }

    /**
     * 
     * @param {String} user username of who chatting with 
     * @param {String} msg message in text
     * @param {Array<{base64Data: String}>} imgs array of imgs data, is a base64 string
     */
    send () {
        const msg = $('#chat-msg').val()
        $('#chat-msg').val('')
        
		const arrImg = []
		for (const pos in this.arrImgsToSend) {
			arrImg.push(this.arrImgsToSend[pos])
			delete this.arrImgsToSend[pos]
		}
		$('#img-preview').html('')

		this.socket.emit('chat to', {
			username: this.currentUser,
			msg: msg,
			imgs: arrImg
		})
    }

    async _getMyInfo () {
        const res = await GetJSON('/api/me')
        return res
    }

    _updateHistory (data) {
        const type = data.type
		const arrMsg = data.arrMsg
		this.currentOffsetMessage += LIMIT_GET_MESSAGE

		if (arrMsg.length < LIMIT_GET_MESSAGE) {
            $('#see-more')
            .text('No more message')
            .off('click')
            .addClass('text-secondary')
		}

		for (const msg of arrMsg) {
			this._displayMessage({
				username: msg.user_send,
				msg: msg.msg,
				imgs: msg.imgs
			}, type)
		}
    }

    /**
     * 
     * @param {{}} data data of socket on `receive chat` 
     */
    showNewMessage (data) {
        this._displayMessage(data, 1)
    }

    _displayMessage (msgInfo, type) {
        const isMe = (this.myName === msgInfo.username) ? 'me' : ''
        const div = this._createMessageDiv(msgInfo, isMe)

        if (type === 1) { // new message
            $('#chat-content').append(div)
            this.scrollNewMessage()
        } else {
            $('#chat-content').prepend(div)
        }
    }

    scrollNewMessage () {
        $('#chat-content').stop().animate({
            scrollTop: $('#chat-content')[0].scrollHeight
        }, 500)
    }

    /**
     * 
     * @param {{username: String, msg: String, imgs: Array}} msgInfo 
     * @param {String} isMe `me` or `` 
     */
    _createMessageDiv (msgInfo, isMe) {
        const user = msgInfo.username
        const msg = msgInfo.msg
        const imgs = msgInfo.imgs

        const div = $('<div/>').addClass('chat-mes ' + isMe).html(`
            <div class='chat-mes-wrap'><div class='chat-mes-user'>${user}</div></div>
            <div class='chat-mes-wrap'><pre class='chat-mes-mes'></pre></div>
        `)

        div.find('.chat-mes-mes').text(msg)

        const imgDiv = $('<div/>').addClass('chat-mes-imgs')
        for (const imgId of imgs) {
            $('<img/>')
            .attr('src', '/storage/' + imgId)
            .on('click', () => {
                $('#image-modal img').attr('src', '/storage/' + imgId)
                $('#image-modal').modal('show')
            })
            .appendTo(imgDiv)
        }
        div.append(imgDiv)

        return div
    }

    _findUserFromURL () {
        const path = new URL(window.location).pathname
        const match = path.match(/chat\/(.*)$/)
        
        if (!match || !match[1]) {
            window.location = '/'
            return
        }
        this.currentUser = match[1]
		$('#user-pic img').attr('src', `/${this.currentUser}/avatar`)
		$('#user-name').text(this.currentUser)
    }
}

export default Chat

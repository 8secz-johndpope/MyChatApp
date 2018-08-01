"use strict"

const LIMIT_GET_MESSAGE = 10

class Chat {
    constructor (chatDisplay) {
        this.socket = io()
        this.user = null
        this.view = chatDisplay
        this.event = {
            "recv": null,
            "send": null
        }

        this.currentOffsetMessage = 0

        $('<div/>').attr('id', 'see-more').addClass('')
        .text('See more')
        .appendTo($(this.view))
    }

    async init () {
        this.user = await this._getMyInfo()
        this.socket.on('receive chat', (data) => {
            if (!this.event.recv) throw new Error('Event Recv not found')
            this.event.recv(data)
        })
        this.socket.on('res msg with', (data) => {
            this._updateHistory(data)
        })
    }

    /**
     * 
     * @param {Function} callback (data: json)=>any 
     */
    onMessage (callback) {
        this.event['recv'] = callback
    }

    /**
     * 
     * @param {String} user username of who chatting with 
     * @param {String} msg message in text
     * @param {Array<{base64Data: String}>} imgs array of imgs data, is a base64 string
     */
    send (user, msg, imgs) {
        if (!user) throw new Error('User undefined')
        if (!imgs) imgs = []
        this.socket.emit('chat to', {
            username: user,
            msg: msg,
            imgs: imgs
        })
    }

    _getMyInfo () {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: '/api/me',
                type: 'GET',
                dataType: 'json',
                success: (json) => {
                    if (json.err) {
                        reject(json.msg)
                    } else {
                        resolve(json.data)
                    }
                },
                error: (err) => {
                    reject(err)
                }
            })
        })
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
			displayMessage(myName, {
				username: msg.user_send,
				msg: msg.msg,
				imgs: msg.imgs
			}, type)
		}
    }

    displayMessage (myName, msgInfo, type) {
        const user = msgInfo.username
        const msg = msgInfo.msg
        const imgs = msgInfo.imgs
        const isMe = (myName === user) ? 'me' : ''
        const chatDiv = $('#chat-content')
    
        const div = $('<div/>').addClass('chat-mes ' + isMe).html(`
            <div class='chat-mes-wrap'><div class='chat-mes-user'>${user}</div></div>
            <div class='chat-mes-wrap'><pre class='chat-mes-mes'>${msg}</pre></div>
        `)
    
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
    
        if (type === 1) { // newer
            chatDiv.append(div)
            scrollNewMessage()
        } else { // older
            chatDiv.prepend(div)
        }
    }

    scrollNewMessage () {
        $('#chat-content').stop().animate({
            scrollTop: $('#chat-content')[0].scrollHeight
        }, 500)
    }
}

module.exports = Chat

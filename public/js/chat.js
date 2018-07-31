(function ($) {
	const socket = io()
	const LIMIT_GET_MESSAGE = 10
	let currentOffsetMessage = 0
	
	const arrImgToSend = {}
	let totalSize = 0
	let posID = 0
	
	let currentUser
	let myName

	socket.on('res msg with', (data) => {
		const type = data.type
		const arrMsg = data.arrMsg
		currentOffsetMessage += LIMIT_GET_MESSAGE

		if (arrMsg.length < LIMIT_GET_MESSAGE) {
			$('#see-more').text('No more message').off('click').addClass('text-secondary')
		}

		for (const msg of arrMsg) {
			// console.log(msg)
			displayMessage(myName, {
				username: msg.user_send,
				msg: msg.msg,
				imgs: msg.imgs
			}, type)
		}
	})

	socket.on('receive chat', (data) => {
		if (data.username !== currentUser && data.username !== myName) {
			return
		}

		displayMessage(myName, {
			username: data.username,
			msg: data.msg,
			imgs: data.imgs
		}, 1)
	})

	socket.on('update user list', (data) => {
		for (const user of data.arr) {
			if (currentUser === user.name) {
				if (user.status === 'active') {
					$('#chat-user-status').addClass('text-success').text('Active now')
				} else {
					$('#chat-user-status').addClass('text-secondary').text('Offline')
				}
			}
		}
	})

	async function initChat () {
		currentUser = findUserFromURL()
		console.log(currentUser)

		const userInfo = await getJSON('/api/user/' + currentUser)
		if (userInfo.err) {
			window.alert(userInfo.msg)
		}
		$('#user-pic img').attr('src', userInfo.data.picture)
		$('#user-name').text(currentUser)

		socket.emit('get msg with', {
			username: currentUser,
			offset: 0,
			limit: LIMIT_GET_MESSAGE,
			type: 1
		})
	}

	$(document).ready(async () => {
		initChat()
		myName = (await getMyInfo()).data.username

		$('#send').on('click', () => {
			const msg = $('#chat-msg').val()
			$('#chat-msg').val('')
			const arrImg = []
			for (const pos in arrImgToSend) {
				arrImg.push(arrImgToSend[pos])
				delete arrImgToSend[pos]
			}
			$('#img-preview').html('')
	
			socket.emit('chat to', {
				username: currentUser,
				msg: msg,
				imgs: arrImg
			})
		})

		$('#chat-msg').on('keydown', (e) => {
			const key = e.keyCode
			const shift = e.shiftKey

			if (key === 13 && !shift) {
				e.preventDefault()
				e.isPropagationStopped()

				$('#send').click()

				return false
			}
		})

		// send image event
		$('#image-file').on('input', async function (e) {
			try {
				const files = Array.from(this.files)

				for (const file of files) {
					createTmpImgPreview(posID)

					const url = URL.createObjectURL(file)
					const data = await getImageBase64(url)
					const size = data.length
					
					totalSize += size
					if (totalSize > 10 * 1024 * 1024) { // 10MB
						window.alert('Files size must be smaller than 10MB')
						$('#img-preview-' + posID).remove()
						return
					}

					const thisPosID = posID
					arrImgToSend[thisPosID] = {
						base64Data: await getImageBase64(url)
					}
					$('#img-preview-' + thisPosID).click(function () {
						$(this).remove()
						totalSize -= size
						delete arrImgToSend[thisPosID]
					}).find('img').attr('src', url)

					posID++
				}
			} catch (err) {
				window.alert(err)
			}
		})

		// see more message
		$('#see-more').on('click', () => {
			socket.emit('get msg with', {
				username: currentUser,
				offset: currentOffsetMessage,
				limit: LIMIT_GET_MESSAGE,
				type: -1 // older
			})
		})
	})	
})(jQuery)

function findUserFromURL () {
	const path = new URL(window.location).pathname
	const match = path.match(/chat\/(.*)$/)
	// console.log(match)
	
	if (!match || !match[1]) {
		window.location = '/'
		return
	}

	return match[1]
}

async function getJSON (url) {
	const res = await fetch(url)
	const json = await res.json()
	return json
}

async function getMyInfo () {
	const res = await fetch('/api/me', {credentials: 'include'})
	const json = await res.json()
	return json
}

function displayMessage (myName, msgInfo, type) {
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

function scrollNewMessage () {
	$('#chat-content').stop().animate({
		scrollTop: $('#chat-content')[0].scrollHeight
	}, 500)
}

function getImageBase64 (src) {
	const resFunc = new Promise((resolve, reject) => {
		const img = $('<img/>').attr('src', src).on('load', () => {
			const canvas = document.createElement('canvas')
			canvas.width = img[0].width
			canvas.height = img[0].height
			const ctx = canvas.getContext('2d')
			ctx.drawImage(img[0], 0, 0)
			const base64data = canvas.toDataURL('image/jpeg').replace('data:image/jpegbase64,', '')
					
			resolve(base64data)
		})
	})

	return resFunc
}

function createTmpImgPreview (posID) {
	$('<div/>').addClass('img-container').attr('id', 'img-preview-' + posID).attr('pos', posID).html(`
		<img src='/images/loading.gif' alt='preview-${posID}' />
	`).appendTo($('#img-preview'))
}

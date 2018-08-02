import ChatModule from './module/Chat.js'
import GetImageBase64 from './module/getImageData.js'
const LIMIT_GET_MESSAGE = 5

$(document).ready(async () => {
	const Chat = new ChatModule()
	await Chat.init()

	Chat.onMessage((data) => {
		Chat.showNewMessage(data)
	})
	
	$('#send').on('click', () => {
		Chat.send()
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
				createTmpImgPreview(Chat.imgId)

				const url = URL.createObjectURL(file)
				const data = await GetImageBase64(url)
				const size = data.length
				
				Chat.totalImgsSize += size
				if (Chat.totalImgsSize > 10 * 1024 * 1024) { // 10MB
					window.alert('Files size must be smaller than 10MB')
					$('#img-preview-' + Chat.imgId).remove()
					return
				}

				const thisPosID = Chat.imgId
				Chat.arrImgsToSend[thisPosID] = {
					base64Data: data
				}
				$('#img-preview-' + thisPosID).click(function () {
					$(this).remove()
					Chat.totalImgsSize -= size
					delete Chat.arrImgsToSend[thisPosID]
				}).find('img').attr('src', url)

				Chat.imgId++
			}
		} catch (err) {
			window.alert(err)
		}
	})

	// see more message
	$('#see-more').on('click', () => {
		Chat.socket.emit('get msg with', {
			username: Chat.currentUser,
			offset: Chat.currentOffsetMessage,
			limit: LIMIT_GET_MESSAGE,
			type: -1 // older
		})
	})
})

function createTmpImgPreview (posID) {
	$('<div/>').addClass('img-container').attr('id', 'img-preview-' + posID).attr('pos', posID).html(`
		<img src='/images/loading.gif' alt='preview-${posID}' />
	`).appendTo($('#img-preview'))
}

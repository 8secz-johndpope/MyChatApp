function getImageBase64 (src) {
	const resFunc = new Promise((resolve, reject) => {
		const img = $('<img/>').attr('src', src).on('load', () => {
			const canvas = document.createElement('canvas')
			canvas.width = img[0].width
			canvas.height = img[0].height
			const ctx = canvas.getContext('2d')
			ctx.drawImage(img[0], 0, 0)
			const base64data = canvas.toDataURL('image/jpeg').replace('data:image/jpeg;base64,', '')
					
			resolve(base64data)
		})
	})
	return resFunc
}

export default getImageBase64

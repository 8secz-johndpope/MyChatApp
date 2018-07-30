(function ($) {
	$(document).ready(async () => {
		createUpdateAvatar()
	})

	function createUpdateAvatar () {
		const avatar = $('.profile-avatar')
		let file

		const button = $('<div/>').addClass('update-avatar')
		button.html(`
		<label class='btn btn-secondary' for='update-avatar-input' title='Change'><i class='fa fa-camera'></i></label>
		<input type='file' name='avatar' accept='.jpg,.png,.bmp,.jpeg' id='update-avatar-input'/>
		<div id='update-avatar' class='btn btn-primary' title='Save'><i class='fa fa-check'></i></div>
		<a id='discard-avatar' href='' class='btn btn-danger' title='Discard'><i class='fa fa-times'></i></a>
		`)
		avatar.append(button)

		$('#update-avatar-input').on('input', function () {
			file = this.files[0]

			const url = URL.createObjectURL(file)
			avatar.find('img').attr('src', url)

			avatar.addClass('is-on-update')
		})

		$('#update-avatar').click(function () {
			const fd = new FormData()
			fd.append('avatar', file, 'avatar.jpg')

			console.log(fd)

			$.ajax({
				url: '/api/user/avatar',
				method: "POST",
				xhrFields: {
					withCredentials: true
				},
				processData: false,
				contentType: false,
				data: fd,
				dataType: 'json',
				success: (json) => {
					if (json.err) {
						window.alert(json.msg)
						// window.location.reload()
					}
					const newUrl = json.new_picture_url
					avatar.find('img').attr('src', newUrl)
					window.location.reload()
				},
				error: (err) => {
					window.alert(err + "")
					// window.location.reload()
				}
			})
		})
	}
})(jQuery)

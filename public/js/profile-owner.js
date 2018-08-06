(function($) {
	$(document).ready(async ()=>{
		createUpdateAvatar();
		$('#profile-cover').find('.profile-change-cover').show();
	});

	function createUpdateAvatar() {
		const avatar = $('.profile-avatar');
		let file;

		const button = $('<div/>').addClass('update-avatar');
		button.html(`
		<label class='btn btn-secondary' for='update-avatar-input' title='Change'><i class='fa fa-camera'></i></label>
		<input type='file' name='avatar' accept='.jpg,.png,.bmp,.jpeg' id='update-avatar-input'/>
		<div id='update-avatar' class='btn btn-primary' title='Save'><i class='fa fa-check'></i></div>
		<a id='discard-avatar' href='' class='btn btn-danger' title='Discard'><i class='fa fa-times'></i></a>
		`);
		avatar.append(button);

		$('#update-avatar-input').on('input', function(e) {
			file = e.target.files[0];

			const url = URL.createObjectURL(file);
			$('#profile-avatar').attr('src', url);

			avatar.addClass('is-on-update');
		});

		$('#update-avatar').click(function() {
			$('#avatar-loading').show();

			const fd = new FormData();
			fd.append('avatar', file, 'avatar.jpg');

			$.ajax({
				url: '/api/user/avatar',
				method: "POST",
				headers: {
					'Accept': 'application/json',
				},
				xhrFields: {
					withCredentials: true,
				},
				processData: false,
				contentType: false,
				data: fd,
				dataType: 'json',
				success: (json) => {
					if (json.err) {
						$('#error-modal')
						.find('.modal-body')
						.text(JSON.stringify(json.err, null, 4));
						$('#error-modal').modal('show');
					}
					console.log(json);
					const newUrl = json.data.new_picture_url;
					$('#profile-avatar').attr('src', newUrl);
					$('#avatar-loading').hide();
					window.location.reload();
				},
				error: (err) => {
					$('#error-modal')
					.find('.modal-body')
					.text(JSON.stringify(err, null, 4));
					$('#error-modal').modal('show');
				},
			});
		});

		$('#cover-input').on('input', function(e) {
			const file = e.target.files[0];

			const fd = new FormData();
			fd.append('cover', file);

			const newFileUrl = URL.createObjectURL(file);
			$('#profile-cover').css('background-image', `url(${newFileUrl})`);

			$('#change-cover-ok, #change-cover-no').removeClass('d-none');
			$('#profile-cover').addClass('is-change');

			$('#change-cover-no').click(()=>{
				$('#change-cover-ok, #change-cover-no').addClass('d-none');
				$('#profile-cover').removeClass('is-change');
				$('#profile-cover').css('background-image', "url(" + $('#profile-cover').data('cover') + ")");
			});

			$('#change-cover-ok').click(async () => {
				const res = await fetch('/api/user/cover-photo', {
					headers: {
						Accept: 'application/json',
					},
					credentials: 'include',
					method: 'POST',
					body: fd,
				});

				const json = await res.json();

				if (json.err) {
					$('#error-modal')
					.find('.modal-body')
					.text(JSON.stringify(json.msg, null, 4));
					$('#error-modal').modal('show');
					$('#change-cover-ok, #change-cover-no').addClass('d-none');
					$('#profile-cover').removeClass('is-change');
					$('#profile-cover').css('background-image', "url(" + $('#profile-cover').data('cover') + ")");
				} else {
					window.location.reload();
				}
			});
		});
	}
})(jQuery);

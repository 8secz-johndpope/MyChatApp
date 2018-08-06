import getBase64Data from "./module/getImageData.js";
import getJson from "./module/getJson.js";

$(document).ready(async function() {
	const objPostImgs = {};
	const arrPostImgs = [];
	let it = 0; // numberic id images, to delete easier

	$("#open-post-modal").click(() => {
		$("#post-modal").modal('show');
	});

	$("#add-image").on('input', async function(e) {
		const files = e.target.files;
		for (const file of files) {
			const src = URL.createObjectURL(file);
			addPreview(src, it);
			const data = await getBase64Data(src);
			objPostImgs[it++] = data;
		}
		updateArrImgs();
	});

	$('#post-image').submit(function(e) {
		e.preventDefault();
		const postText = $('#post-text').val();
		const postImgs = arrPostImgs;
		const bodyData = {
			description: postText,
			photos: postImgs,
		};

		$('#post-image').find('.modal-header, .modal-body, .modal-footer').fadeOut(100);
		$('#status').css('width', '50%');
		$('#status-text').text('Posting...');

		fetch('/api/post', {
			method: 'POST',
			credentials: 'include',
			headers: {
				'content-type': 'application/json',
			},
			body: JSON.stringify(bodyData),
		}).then((res)=>{
			return res.json();
		}).then((json) => {
			if (json.err) {
				window.alert(json.msg);
				return;
			}
			$('#status').css('width', '100%');
			$("#post-modal").modal('hide');
			window.location.reload();
		}).catch((err) => {
			console.log(err);
			window.alert(err);
		});
	});

	function updateArrImgs() {
		arrPostImgs.length = 0;
		for (const key in objPostImgs) {
			if (!objPostImgs.hasOwnProperty(key)) continue;
			arrPostImgs.push(objPostImgs[key]);
		}
	}

	function addPreview(src, id) {
		const img = $("<img/>").attr('src', src);
		const div = $('<div/>').addClass('image-wrap').append(img);
		
		div.on('click', function ClickOnImagePreview() {
			$(this).remove();
			delete objPostImgs[id];
		});

		$('#image-preview').append(div);
	}
});

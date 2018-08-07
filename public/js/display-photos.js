import getJson from './module/getJson.js';

$(document).ready(async function() {
	const myName = findNameInURL();
	let offset = 0;
	const LIMIT = 5;

	// init
	await getPost(offset, LIMIT);

	// see-more click
	$('#see-more-post').on('click', ()=>{
		offset += LIMIT;
		getPost(offset, LIMIT);
	});

	async function getPost(offset, limit) {
		const json = await getJson(`/api/posts/${myName}?offset=${offset}&limit=${limit}`);
		const data = json.data;
		for (const post of Array.from(data)) {
			const time = new Date(post.date).toLocaleString('vi-vn');
			const section = $('<section/>').addClass('post card mt-4 shadow').html(`
			<div class='card-body'>
				<h3 class='card-title post-description'></h3>
				<div class='card-subtitle'>${time}</div>
				<div class='post-photos photo-grid'></div>
			</div>
			`);
			section.find('.post-description').text(post.description);
			const sectionPhoto = section.find('.post-photos');

			for (const photoId of post.photos) {
				const src = '/storage/' + photoId;
				const img = $('<img/>').attr('src', src);
				img.on('click', function() {
					showPost(post._id, photoId);
				});
				sectionPhoto.append(img);
			}

			$('#post').append(section);
		}
	}

	async function showPost(postID, photoIdActive) {
		const modal = $('#modal-carousel');
		const carousel = $('#show-post-list');
		carousel.html(`
			<div id='modal-img-loading' class='d-flex flex-row justify-content-center'>
				<img src='/images/loading.gif' alt='Loading'/>
			</div>
		`);
		const postData = (await getJson('/api/post/' + postID)).data;

		modal.find('.modal-title').text(postData.description);
		modal.find('.modal-text').text(new Date(postData.date).toLocaleString('vi-vn'));
		
		for (const photoId of Array.from(postData.photos)) {
			const item = $('<div/>').addClass('carousel-item');
			
			const img = $('<img/>').addClass('w-100 d-block').attr('src', `/storage/${photoId}?width=1280`);
			item.append(img);
			if (photoId === photoIdActive) {
				item.addClass('active');
				img.on('load', ()=>{
					$('#modal-img-loading').remove();
				});
			}

			carousel.append(item);
		}

		$("#show-post").carousel({
			interval: false,
		});
		modal.modal('show');
	}

	function findNameInURL() {
		const path = window.location.pathname.match(/\/([a-zA-Z_0-9]+)$/)[1];
		return path;
	}
});

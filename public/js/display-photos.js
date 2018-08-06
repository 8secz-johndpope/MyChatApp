import getJson from './module/getJson.js';

$(document).ready(async function() {
	const myName = (await getJson('/api/me')).data.username;
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
				sectionPhoto.append(img);	
			}

			$('#post').append(section);
		}
	}
});

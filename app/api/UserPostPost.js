const returner = require('./ApiReturn');
const router = require('express').Router();

function UserHandlePost(database, StoreImage) {
	/**
	 * get posts of user
	 */
	router.post('/api/post', async (req, res)=>{
		if (!req.session || !req.session.user) {
			res.end(returner.error("Missing credentials"));
			return;
		}
		const username = req.session.user;

		if (!req.body.description || !req.body.photos) {
			res.end(returner.error("Missing data"));
			return;
		}
		const now = new Date().getTime();
		const postDescription = req.body.description;
		const postPhotos = req.body.photos.map((val)=>{
			return Buffer.from(val, 'base64');
		});

		const arrIdOfPhotos = [];
		for (const photoBuffer of Array.from(postPhotos)) {
			const id = await StoreImage.addImage(photoBuffer);
			arrIdOfPhotos.push(id);
		}

		const db = await database.ready();
		const insertResult = await db.collection('Post').insertOne({
			username: username,
			description: postDescription,
			photos: arrIdOfPhotos,
			date: now,
		});

		if (insertResult.result.ok) {
			res.end(returner.success());
		} else {
			res.end(insertResult.result);
		}
	});

	return router;
}

module.exports = UserHandlePost;

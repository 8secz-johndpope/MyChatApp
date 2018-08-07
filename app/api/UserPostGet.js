const returner = require('./ApiReturn');
const router = require('express').Router();
const ObjectId = require('mongodb').ObjectID;

const DEFAULT_OFFSET = 0;
const DEFAULT_LIMIT = 5;

function UserHandlePost(database, StoreImage) {
	/**
	 * get posts of user
	 */
	router.get('/api/posts/:username', async (req, res)=>{
		if (!req.session || !req.session.user) {
			res.end(returner.error("Missing credentials"));
			return;
		}
		
		const username = req.params.username;
		let offset = +req.query.offset;
		let limit = +req.query.limit;
		if (!offset) offset = DEFAULT_OFFSET;
		if (!limit) limit = DEFAULT_LIMIT;
		
		const db = await database.ready();

		const arrRes = await db.collection('Post')
								.find({username: username})
								.sort({date: -1})
								.skip(offset)
								.limit(limit)
								.toArray();
		res.end(returner.success(arrRes));
	});

	/**
	 * get a post by id
	 */
	router.get('/api/post/:id', async (req, res)=>{
		if (!req.session || !req.session.user) {
			res.end(returner.error('Missing credentials'));
			return;
		}

		const idPost = req.params.id;
		if (!idPost) {
			res.end(returner.error('Missing id'));
			return;
		}

		const db = await database.ready();
		const arrRes = await db.collection('Post').find(ObjectId(idPost)).toArray();

		const result = (arrRes.length > 0) ? arrRes[0] : {};
		res.end(returner.success(result));
	});

	return router;
}

module.exports = UserHandlePost;

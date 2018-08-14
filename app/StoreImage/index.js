/**
 * Store Image module
 * @module StoreImage
 */

const express = require('express');
const config = require('../../config');
const path = require('path');
const Logger = require('../logging');
const fs = require('fs');
const NO_IMAGE_PATH = path.join(__dirname, '../../public/images/no-image.png');

function StoreImage() {
	if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test_web') {
		const GooglePhotos = require("../connect-google-photos");
		this.type = 'google';
		this.storage = GooglePhotos;
		Logger.info('Use Google Photos for image storage');
	} else {
		const StoreLocal = require('../store-image-local')(config.LocalStorage);
		this.type = 'local';
		this.storage = StoreLocal;
		Logger.info('Use Local Folder for image storage');
	}
}

StoreImage.prototype.init = async function() {
	if (this.type === 'google') {
		await this.storage.init();
	} // else, local storage doesn't need init
},

/**
 * 
 * @param {Buffer | String} data
 * @param {{}} opts
 * @return {Promise<String>} id of image 
 */
StoreImage.prototype.addImage = async function(data, opts) {
	const idImage = await this.storage.addImage(data, opts);
	return idImage;
},

/**
 * @return {Promise<String>} url of image
 * @param {String} idImage id of image
 * @param {String} imageType type: public or private
 */
StoreImage.prototype.getImageUrl = async function(idImage, imageType) {
	if (this.type === 'google' && imageType === 'public') {
		const url = await this.storage.getPublic(idImage);
		return url;
	}
	return '/storage/' + idImage;
},

/**
 * use for express server
 * @return {void}
 */
StoreImage.prototype.static = function() {
	const router = express.Router();
	router.get('/storage/:idImage', async (req, res) => {
		if (!req.session || !req.session.user) {
			res.status(401).send('Missing credentials');
			return;
		}
		const idImage = req.params.idImage;
		const width = req.query.width ? +req.query.width : 768;
		const height = req.query.height ? +req.query.height : 768;
	
		if (this.type === 'google') {
			const data = await this.storage.getPrivate(idImage, width, height);
			if (!data) {
				res.sendFile(NO_IMAGE_PATH);
			} else {
				res.setHeader('Content-Type', 'image/jpeg');
				res.end(Buffer.from(data));
			}
		} else {
			const filepath = path.join(this.storage.folder, "/" + idImage + ".jpeg");
			if (!fs.existsSync(filepath)) res.sendFile(NO_IMAGE_PATH);
			else res.sendFile(filepath);
		}
	});
	return router;
},

/**
 * @exports StoreImage
 */
module.exports = new StoreImage();

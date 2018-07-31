/**
 * Store Image module
 * @module StoreImage
 */

const config = require('../../config')
const path = require('path')
const Logger = require('../logging')
const URL = require('url')
const fs = require('fs')
const NO_IMAGE_PATH = path.join(__dirname, '../../public/images/no-image.png')

const StoreLocal = require('../store-image-local')(config.LocalStorage)
const GooglePhotos = require("../connect-google-photos")

const StoreImage = function () {
	if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test_web') {
		this.type = 'google'
		this.storage = GooglePhotos
		Logger.info('Use Google Photos for image storage')
	} else {
		this.type = 'local'
		this.storage = StoreLocal
		Logger.info('Use Local Folder for image storage')
	}
}

StoreImage.prototype.init = async function () {
	if (this.type === 'google') {
		await this.storage.init()
	}
}

/**
 * 
 * @param {Buffer | String} data
 * @returns id of image 
 */
StoreImage.prototype.addImage = async function (data, opts) {
	const idImage = await this.storage.addImage(data, opts)
	return idImage
}

/**
 * @returns url of image
 * @param {String} idImage id of image 
 */
StoreImage.prototype.getImageUrl = async function (idImage, imageType) {
	if (this.type === 'google' && imageType === 'public') {
		const url = await this.storage.getPublic(idImage)
		return url
	}

	return '/storage/' + idImage
}

/**
 * use for express server
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
StoreImage.prototype.static = function () {
	const router = async (req, res, next) => {
		const url = URL.parse(req.url).pathname.replace(/(^\/)|(\/$)/g, '').split('/')

		if (url.length !== 2) {
			next()
			return
		}

		const id = url[1].replace(' ', '')
		const pathname = url[0]

		if (pathname === "storage" && !!id) { // id is not '', null, false or undefined
			if (req.method !== 'GET') {
				res.status(404)
				res.setHeader('Allow', 'GET')
				res.end()
				return
			}

			if (this.type === 'google') {
				const data = await this.storage.getPrivate(id)
				if (!data) {
					res.sendFile(NO_IMAGE_PATH)
				} else {
					res.setHeader('Content-Type', 'image/jpeg')
					res.send(Buffer.from(data))
					res.end()
				}
			} else {
				const filepath = path.join(this.storage.folder, '/' + id + '.jpeg')

				if (!fs.existsSync(filepath)) {
					res.sendFile(NO_IMAGE_PATH)
				} else {
					res.sendFile(filepath)
				}
			}
			
			return
		}

		next()
	}

	return router
}

/**
 * @exports StoreImage
 */
module.exports = new StoreImage()

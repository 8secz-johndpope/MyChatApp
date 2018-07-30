const config = require('../../config')
const path = require('path')
const Logger = require('../logging')
const URL = require('url')

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
StoreImage.prototype.addImage = async function (data) {
	const idImage = await this.storage.addImage(data)
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
				res.setHeader('Content-Type', 'image/jpeg')
				res.send(Buffer.from(data))
				res.end()
			} else {
				res.sendFile(path.join(this.folder, '/' + id + '.jpeg'))
			}
			
			return
		}

		next()
	}

	return router
}

module.exports = new StoreImage()

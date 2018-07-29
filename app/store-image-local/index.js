const sharp = require('sharp')
const fs = require('fs')
const path = require('path')
const URL = require('url')

const ID_LENGTH = 20 // 26^20 is big !

/**
 * this object is write for store image easiser
 * I prepare to store with online storage server, or just localfile
 * @param { { public: String, private: String } } config
 */
function StoreImage (folder) {
	this.folder = folder
	this.folderName = path.dirname(folder)

	if (!fs.existsSync(this.folder)) {
		fs.mkdirSync(this.folder)
	}
	console.log("Use directory " + this.folder + "for storage")

	/**
	 * require body-parser to use it
	 * @param {*} req 
	 * @param {*} res 
	 * @param {*} next 
	 */
	this.static = function () {
		return (req, res, next) => {
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

				console.log(path.join(this.folder, '/' + id + '.data'))
				res.sendFile(path.join(this.folder, '/' + id + '.data'))
				
				return
			}

			next()
		}
	}

	/**
	 * 
	 * @param {String | Buffer} buffer 
	 * @param {{width ?: 320, quality ?: 70}} opts 
	 */
	this.add = async (buffer, opts = {width: 320, quality: 70}) => {
		if (!buffer) return false

		if (!opts.width) opts.width = 320
		if (!opts.quality) opts.quality = 70

		try {
			let obj = sharp(buffer)
			
			if (opts.width) obj = obj.resize(opts.width)
			
			const data = await obj.resize(opts.width)
							.jpeg({quality: opts.quality})
							.toBuffer()

			return data
		} catch (err) {
			return null
		}
	}

	/**
	 * @param {String | Buffer} data data of file image
	 * @returns id of image
	 */
	this.addImage = async function (data) {
		const id = await this._makeUniqeId()
		const filepath = path.join(this.folder, id + ".data")

		const compressedData = await this.add(data)

		fs.writeFileSync(filepath, compressedData)
		return id
	}

	/**
	 * 
	 * @param {String} id  id of image
	 */
	this.getImagePath = function (id) {
		return '/storage/' + id
	}

	this._makeRandomString = (length) => {
		const charPossible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
		let res = ""

		for (let i = 0; i < length; ++i) {
			let randomNum = Math.trunc(Math.random() * charPossible.length)
			res += charPossible.charAt(randomNum)
		}

		return res
	}

	/**
	 * make id of image
	 */
	this._makeUniqeId = async function () {
		let id = this._makeRandomString(ID_LENGTH)

		// check if id exists
		while (fs.existsSync(path.join(this.folder, id + ''))) {
			id = this._makeRandomString(ID_LENGTH)
		}

		return id
	}

	return this
} 

module.exports = StoreImage

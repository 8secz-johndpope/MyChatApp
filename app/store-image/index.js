/**
 * this object is write for store image easiser
 * I prepare to store with online storage server, or just localfile
 */

StoreImage = function()
{
	const sharp = require('sharp');
	const fs = require('fs');
	let data = Buffer(''); //just for interface

	/**
	 * 
	 * @param {String | Buffer} buffer 
	 * @param {{width: number, quality: number}} opts 
	 */
	this.add = async (buffer, opts = { width: 320, quality: 70 })=>{
		let obj = sharp(buffer);
		if (opts.width) obj = obj.resize(opts.width);
		data = await obj.resize(opts.width)
						.jpeg({quality: opts.quality})
						.toBuffer();
	}

	/**
	 * @return {Promise<NodeJS.ErrnoException>}
	 * @param {String} name name of file, exclude path & extension 
	 * @param {(err)=>any} callback 
	 */
	this.save = function (pathfile = require, callback = (err)=>any)
	{
		return new Promise((resolve, reject)=>{
			fs.writeFile(pathfile, data, (err)=>{
				callback(err);
				if (err) {
					reject(err);
				}
				resolve(null)
			});
		})
	}

	return this;
} 

module.exports = StoreImage;
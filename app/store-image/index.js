/**
 * this object is write for store image easiser
 * I prepare to store with online storage server, or just localfile
 */

StoreImage = function()
{
	const sharp = require('sharp');
	const fs = require('fs');
	let data;

	/**
	 * 
	 * @param {String | Buffer} buffer 
	 * @param {{width ?: 320, quality ?: 70}} opts 
	 */
	this.add = async (buffer, opts = {width: 320, quality: 70})=>{
		if (!buffer) return false;

		if (!opts.width) opts.width = 320;
		if (!opts.quality) opts.quality = 70;

		
		try {
			let obj = sharp(buffer);
			
			if (opts.width) obj = obj.resize(opts.width);
			
			data = await obj.resize(opts.width)
							.jpeg({quality: opts.quality})
							.toBuffer();
		} catch (err) {
			return false;
		}

		return true;
	}

	/**
	 * @return {Promise<NodeJS.ErrnoException>}
	 * @param {String} name name of file, exclude path & extension 
	 * @param {(err)=>any} callback 
	 */
	this.save = function (pathfile, callback)
	{
		return new Promise((resolve, reject)=>{
			if (!data) reject("No data");
			
			fs.writeFile(pathfile, data, (err)=>{
				
				if (typeof callback == 'function') callback(err);
				
				if (err) {
					reject(err);
				}
				
				resolve(true)
			});
		})
	}

	return this;
} 

module.exports = StoreImage;
class StoreImage {
	constructor()
	{
		this.database = require("../connect-mongo")();
		this.sharp = require('sharp');
		this.data = null;
	}

	/**
	 * add data image to sharp
	 * @param {String | Buffer} buffer 
	 * @param { {width: number, quality: number } } opts quality: 0-100
	 */
	async add(buffer, opts = { width: 320, quality: 70 })
	{
		let obj = this.sharp(buffer);
		if (opts.width) obj = obj.resize(opts.width);
		this.data = await obj.resize(opts.width)
							.jpeg({quality: opts.quality})
							.toBuffer();
	}

	/**
	 * 
	 * @param {String} name name of file, exclude path & extension 
	 * @param {(err)=>any} callback 
	 */
	save(pathfile, callback)
	{
		const fs = require('fs');
		fs.writeFile(pathfile, this.data, (err)=>{
			callback(err);
		});
	}
}

module.exports = StoreImage;
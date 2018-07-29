const auth = require('./AuthorizeService')
const fetch = require('node-fetch')

const DEFAULT_PHOTO_LIMITS = 5
const DEFAULT_ALBUM_LIMITS = 10

function ConnectGooglePhotos () {
	this.access_token = false
}

/**
 * upload image
 * @param {String} albumId
 * @param {String} filename
 * @param {String | Buffer } data
 * @param {Function} callback
 * @return  image object
 */
ConnectGooglePhotos.prototype.upload = async function (albumId, filename, data, callback) {
	const uploadHeader = {
		Authorization: 'Bearer ' + this.access_token,
		'X-Goog-Upload-File-Name': filename
	}
	const finalHeader = {
		Authorization: 'Bearer ' + this.access_token
	}

	const tokenRes = await fetch('https://photoslibrary.googleapis.com/v1/uploads', {
		headers: uploadHeader,
		method: 'POST',
		body: Buffer.from(data)
	})
	const uploadToken = await tokenRes.text()

	const fileMetadata = {
		albumId: albumId,
		newMediaItems: [
			{
				"description": filename,
				"simpleMediaItem": {
					"uploadToken": uploadToken
				}
			}
		]
	}

	const res = await fetch("https://photoslibrary.googleapis.com/v1/mediaItems:batchCreate", {
		headers: finalHeader,
		method: 'POST',
		body: JSON.stringify(fileMetadata)
	})
	const json = await res.json()

	if (!json || !json.newMediaItemResults[0]) {
		throw json
	}
	const file = json.newMediaItemResults[0].mediaItem

	if (!file) throw json

	if (typeof callback === 'function') {
		callback(file)
	}

	return file
}

/**
 * list media items
 * @param {Number} limit 
 * @param {Function} callback 
 */
ConnectGooglePhotos.prototype.list = async function (limit, callback) {
	// check limit param
	limit = (limit < 1) ? DEFAULT_PHOTO_LIMITS : limit

	const Headers = {
		"Content-Type": 'application/json',
		"Authorization": "Bearer " + this.access_token
	}

	const res = await fetch("https://photoslibrary.googleapis.com/v1/mediaItems:search", {
		headers: Headers,
		method: 'POST',
		body: JSON.stringify({pageSize: limit + ""})
	})

	const listRes = await res.json()

	if (typeof callback === 'function') {
		callback(listRes.mediaItems)
	}

	if (!listRes.mediaItems) return []
	return listRes.mediaItems
}

/**
 * list all photo albums
 * @param {Number} limit 
 * @param {Function} callback 
 */
ConnectGooglePhotos.prototype.listAlbums = async function (limit, callback) {
	// check limit param
	limit = (limit < 1) ? DEFAULT_ALBUM_LIMITS : limit

	const Headers = {
		"Content-Type": 'application/json',
		"Authorization": "Bearer " + this.access_token
	}

	const res = await fetch("https://photoslibrary.googleapis.com/v1/albums", {
		headers: Headers
	})

	const listRes = await res.json()

	if (typeof callback === 'function') {
		callback(listRes.albums)
	}

	if (!listRes.albums) return []
	return listRes.albums
}

/**
 * make album shareable
 * @param {String} albumID 
 * @param {boolean} isShare
 * @return {Promsize<String>} url of album if shareable call success
 */
ConnectGooglePhotos.prototype.shareAlbum = async function (albumID) {
	const Headers = {
		"Content-Type": 'application/json',
		"Authorization": "Bearer " + this.access_token
	}

	const res = await fetch(
		`https://photoslibrary.googleapis.com/v1/albums/${albumID}:share`, {
			headers: Headers,
			method: 'POST',
			body: JSON.stringify({
				shareAlbumOptions: {
					isCollaborative: true,
					isCommentable: false
				}
			})
		}
	)
	const resJSON = await res.json()
	return resJSON
}

/**
 * get album by name
 * @param {String} name
 * @return {Promise<any>} album Object
 */
ConnectGooglePhotos.prototype.getAlbumByName = async function (name) {
	const albums = await this.listAlbums(20) // maybe just 3-4 albums but 20 for sure

	// Array.from for sure albums is iterable
	for (const album of Array.from(albums)) {
		if (album.title === name) {
			return album
		}
	}

	// if cannot find
	return null
}

/**
 * get album by name, if not, create one
 * @param {String} name name of album
 * @param {{canShare : boolean}} opts
 * @return album object
 */
ConnectGooglePhotos.prototype.getAlbumByNameOrCreate = async function (name) {
	const existOne = await this.getAlbumByName(name)
	if (existOne) return existOne

	// if not exists, create one
	const Headers = {
		"Content-Type": 'application/json',
		"Authorization": "Bearer " + this.access_token
	}

	const res = await fetch(
		"https://photoslibrary.googleapis.com/v1/albums", {
			headers: Headers,
			method: "POST",
			body: JSON.stringify({
				album: {
					title: name
				}
			})
		}
	)
	const resJSON = await res.json()

	return resJSON
}

/**
 * get mediaItem (photo)
 * @param {String} mediaId
 * @returns mediaItem Object 
 */
ConnectGooglePhotos.prototype.getImage = async function (mediaId) {
	const res = await fetch(`https://photoslibrary.googleapis.com/v1/mediaItems/${mediaId}`)

	const json = await res.json()

	return json
}

/**
 * 
 * @param {String} albumID 
 * @param {Function} callback 
 */
ConnectGooglePhotos.prototype.listInAlbum = async function (albumID, callback) {
	const limit = DEFAULT_PHOTO_LIMITS

	const Headers = {
		"Content-Type": 'application/json',
		"Authorization": "Bearer " + this.access_token
	}

	const res = await fetch("https://photoslibrary.googleapis.com/v1/mediaItems:search", {
		headers: Headers,
		method: 'POST',
		body: JSON.stringify({
			albumId: albumID,
			pageSize: limit
		})
	})

	const listRes = await res.json()

	if (typeof callback === 'function') {
		callback(listRes.mediaItems)
	}

	if (!listRes.mediaItems) return []
	return listRes.mediaItems
}

/**
 * wait to connect to service and get the token
 * @param {Function} callback
 * @returns {Promise<void>} nothing, just await
 */
ConnectGooglePhotos.prototype.init = async function (callback) {
	this.access_token = await auth.getToken()

	this.albums = {}
	this.albums.public = await this.getAlbumByNameOrCreate('Public')
	if (!this.albums.public.shareInfo || !this.albums.public.shareInfo.shareableUrl) {
		this.shareAlbum(this.albums.public.id)
	}
	this.albums.private = await this.getAlbumByNameOrCreate('Private')

	if (typeof callback === 'function') {
		callback()
	}
} 

module.exports = new ConnectGooglePhotos()

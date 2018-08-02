export default async function (url) {
	const res = await fetch(url, {
		credentials: 'include'
	})
	const json = await res.json()
	return json
}
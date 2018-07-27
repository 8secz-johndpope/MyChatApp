# MY CHAP APP

A simple social chat website write in NodeJS

Demo [beohoang98-chat-app.herokuapp.com](https://beohoang98-chat-app.herokuapp.com)

I'm still learning Node and the app still in development so it will be a lot of bugs and missing lots of features

If you love it, [fork my repos](https://github.com/beohoang98/myChatApp/fork) and [develop](https://github.com/beohoang98/MyChatApp/pulls) it with me <3

[![Build Status](https://travis-ci.org/beohoang98/MyChatApp.svg?branch=master)](https://travis-ci.org/beohoang98/MyChatApp)

---

## Library and Stack:

Server:
- [express] and [ejs] - for create server-side and render views
- [mongodb] - for storing user infomation and chat history
- [cookie-session] - for storing session in client cookie
- [body-parser] - read post request
- [express-fileupload] - handle post file image request
- [sharp] - to resize and downquality for image, keep storage small
- [socket-io] - for realtime application (chat, check active user)
- [express-socket.io-session] - for share session to [socket.io]
- [bcrypt] - for hashing user password
- [winston] - for logging

Client
- [JQuery] and [Bootstrap 4] for UI
- [Font Awesome] for icon

---

## Reference Sources

I'm study and learn best practices from

- [Chat.io](https://github.com/OmarElGabry/chat.io)
- [RaspChat](https://github.com/maxpert/raspchat)

- Learning basic node [https://www.tutorialspoint.com/nodejs/nodejs_quick_guide.htm](https://www.tutorialspoint.com/nodejs/nodejs_quick_guide.htm)
- Another page to learn [http://online.khoapham.vn/7-nodejs](http://online.khoapham.vn/7-nodejs)

---

## Things learned

- [X] Create server with [node] and [express]
- [X] Checking user login by [cookie-session]
- [X] Store user and chat infomation by [mongodb]
- [X] Get post data and file with [express-fileupload]
- [X] Compress file for limited storage (with [sharp])
- [ ] Store file, image to File Storage instead storage of server
- [ ] User can send **emoji** and **image** to each others
- [ ] User can **play games** with each others
- [ ] User can make change personal profile
- [ ] Privacy on user
- etc...i haven't think more yet

## Try it `(if you love my project)`

Clone my repos:

```bash
git clone https://github.com/beohoang98/MyChatApp.git
cd MyChatApp
```

Config your server and database on file `config.json`

```json
{
	"keys": [
		"<your_local_random_key_1>",
		"<your_local_random_key_2>"
	],
	"LOCAL_DATABASE_URL": "mongodb://<dbusername>:<dbpass>@<your_host>/<your_database_name>",
	"HASH": {
		"SALT_ROUND": 10 // change to greater number if you want more secure your hash
	}
}
```

Start server with [node] and [npm]:

```bash
npm start
```
or
```bash
node index.js
```

[express]: https://www.npmjs.com/package/express
[ejs]: https://www.npmjs.com/package/ejs
[socket-io]: https://www.npmjs.com/package/socket.io
[mongodb]: https://www.npmjs.com/package/mongodb
[cookie-session]: https://www.npmjs.com/package/cookie-session
[express-socket.io-session]: https://www.npmjs.com/package/express-socket.io-session
[sharp]: https://www.npmjs.com/package/sharp
[bcrypt]: https://www.npmjs.com/package/bcrypt
[express-fileupload]: https://www.npmjs.com/package/express-fileupload
[body-parser]: https://www.npmjs.com/package/body-parser
[winston]: https://www.npmjs.com/package/winston

[JQuery]: https://jquery.com/
[Bootstrap 4]: https://getbootstrap.com/
[Font Awesome]: https://fontawesome.com/

[node]: https://nodejs.org/en/
[npm]: https://www.npmjs.com/
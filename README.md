# MY CHAP APP

A simple social chat website write in NodeJS

---

## Library use:

Server:
- [ejs] - for create server-side and render views
- [mongodb] - for storing user infomation and chat history
- [cookie-session] - for storing session in client cookie
- [body-parser] - read post request
- [express-fileupload] - handle post file image request
- [sharp] - to resize and downquality for image, keep storage small
- [socket-io] - for realtime application (chat, check active user)
- [express-socket.io-session] - for share session to [socket.io]
- [bcrypt] - for hashing user password

Client
- [jquery] and [bootstrap] in client-side

---

## Reference Sources (I'm study and learn best practices from)

- [Chat.io](https://github.com/OmarElGabry/chat.io)

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

[jquery]: https://jquery.com/
[bootstrap]: https://getbootstrap.com/
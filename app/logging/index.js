const { createLogger, transports, format, addColors } = require('winston');

const logger = createLogger({
	format: format.combine(
		format.colorize(),
		format.timestamp(),
		format.splat(),
		format.simple()
	),
	transports: [
		new transports.Console({
			handleExceptions: true
		})
	],
	exceptionHandlers: [
		new transports.Console({
			handleExceptions: true
		})
	],
	exitOnError: false
})

// addColors({
// 	err: 'bold red',
// 	warn: 'italic yellow',
// 	database: 'blue',
// 	user: 'green'
// })

module.exports = logger;
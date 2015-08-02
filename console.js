var statis = require('./lib/statis')

var colors = require('colors')

var argv = require('yargs')
	// Configuration
	.default('c', 'config.json')
	.alias('c', 'config')
		.describe('c', 'Specify the configuration file')
	// Help
	.help('h')
	.alias('h', 'help')
		.describe('h', 'Print this help')
	// Daemon mode
	.default('d')
	.alias('d', 'daemon')
     .describe('d', 'Run as a daemon')
	.argv

var fs = require('fs')
var nconf = require('nconf')

// Parse configuration file
configFile = argv.c
nconf.file({file: configFile})
var nodes = nconf.get('nodes')
if (typeof nodes === "undefined") {
	console.log("No configuration found".red)
	process.exit(1)
}

// Listen to results and report them to console
statis.on('result', function(result) {
	var message = result.message
	if (result.status == 'error') {
		console.log(message.red)
	} else if (result.status == 'success') {
		console.log(message.green)
	} else if (result.status == 'warning') {
		console.log(message.yellow)
	}
})

// Register listeners for notifications i.e. pushover
statis.registerNotificationListeners(nconf.get('notifications'))

// Do the work
statis.scan(nodes, argv.d)

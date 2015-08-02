var statis = require('./lib/statis')

var colors = require('colors')

var optimist = require('optimist')
var argv = optimist
	.usage('Usage: $0')
	// Help
	.default('h')
	.alias('h', 'help')
    .describe('h', 'Print this help')
	// Configuration source
	.default('c', 'config.json')
	.alias('c', 'config')
    .describe('c', 'Specify the configuration file')
    // Interval in seconds
	.default('d')
	.alias('d', 'daemon')
     .describe('d', 'Run as a daemon')
	.argv

// Print help screen
if (argv.h) {
	console.log(optimist.help())
	return
}

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

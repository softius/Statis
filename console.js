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
	.argv

// Print help screen
if (argv.h) {
	console.log(optimist.help())
	return
}

var fs = require('fs')
var nconf = require('nconf')
configFile = argv.c

nconf.file({file: configFile})

var nodes = nconf.get('nodes')
if (typeof nodes === "undefined") {
	console.log("No configuration found".red)
	process.exit(1)
}

statis.on('result', function(result) {
	var message = result.message
	if (result.status == 'error') {
		console.log(message.red)
	} else {
		console.log(message.green)
	}
})

function statis_analysis()
{
	for (var i=0; i<nodes.length; i++) {
		if (nodes[i].http)
			statis.http(nodes[i])

		if (nodes[i].socket)
			statis.socket(nodes[i])

		if (nodes[i].mysql)
			statis.mysql(nodes[i])
	}
}
statis_analysis()




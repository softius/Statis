var statis = require('./lib/statis')

var fs = require('fs')
var nconf = require('nconf')

var colors = require('colors')

nconf.file({file: './config.json'})

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




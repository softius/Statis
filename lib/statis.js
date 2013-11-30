var http = require('http')
var socket = require('net')
var mysql = require('mysql')

var events = require('events');
var eventEmitter = new events.EventEmitter();

module.id = 'statis'

var Statis = {
	// events: eventEmitter,  
	notify: function(message)
	{
		eventEmitter.emit('result', message)
		// Statis.events.emit('result', message)
	},

	doHttp: function(node)
	{
		var node_label = node.label
		var request = http.request(
			node.http,
			function(res) {
				request.destroy()

				if (res.statusCode >= 400) {
					Statis.notify({"status": "error", "label": node_label, "message": node_label + " Status " + res.statusCode})
				} else {
					Statis.notify({"status": "success", "label": node_label, "message": node_label + " [OK]"})
				}
			}
		)
		request.setTimeout(2 * 1000, function() {
			request.destroy()
			Statis.notify({"status": "warning", "label": node_label, "message": node_label + " Reached timeout"})
		})
		request.on('error', function(e) {
			Statis.notify({"status": "error", "label": node_label, "message": node_label + " " + e.message})
		})
		request.end()
	},

	doSocket: function(node)
	{
		var node_label = node.label
		var s = socket.connect(node.socket.port, node.socket.host)
		s.on('connect', function() {
			s.destroy()
			Statis.notify({"status": "success", "label": node_label, "message": node_label + " [OK] "})
		}).on('error', function(e) {
			Statis.notify({"status": "error", "label": node_label, "message": node_label + " [ERROR] " + e.message})
		})
	},

	doMysql: function(node)
	{
		var node_label = node.label
		var connection = mysql.createConnection(node.mysql)
		connection.connect(function(err) {
			connection.destroy()
			if (!err) {
				Statis.notify({"status": "success", "label": node_label, "message": node_label + " [OK] "})
			} else {
				Statis.notify({"status": "error", "label": node_label, "message": node_label + " " + err.message})
			}
		})
	}
}

module.exports.http = function(node) { Statis.doHttp(node) }
module.exports.socket = function(node) { Statis.doSocket(node) }
module.exports.mysql = function(node) { Statis.doMysql(node) }
module.exports.on = function(event, listener) { eventEmitter.on(event, listener) }
module.exports.removeListener = function(event, listener) { eventEmitter.removeListener(event, listener) }

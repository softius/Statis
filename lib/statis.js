var http = require('http')
var socket = require('net')
var mysql = require('mysql')

var events = require('events')
var eventEmitter = new events.EventEmitter()

var CronJob = require('cron').CronJob

module.id = 'statis'

var Statis = {
	registerNotificationListeners: function(config)
	{
		if (config == undefined)
			return

		if (config.pushover != undefined) {
			this.initPushoverClient(config.pushover.token)
			this.registerPushoverListener(config.pushover.users)
		}
	},

	initPushoverClient: function(token)
	{
		var push = require('pushover-notifications')
		this.pushoverClient = new push({
			"token": token,
			"update_sounds": false
		})
	},

	registerPushoverListener: function(users)
	{
		var pushoverUsers = users
		var pushoverClient = this.pushoverClient
		eventEmitter.on('result', function(result) {
			if (result.status != 'error')
				return	// return so that no notifications are sent

			var msg = {
				message: result.message,
				title: result.label,
				sound: 'alien',
				priority: 1
			}

			for (var i=0; i<pushoverUsers.length; i++) {
				msg.user = pushoverUsers[i]
				// console.log(msg)
				pushoverClient.send(msg)
			}
		})
	},

	notify: function(message)
	{
		eventEmitter.emit('result', message)
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
		})
		s.on('error', function(e) {
			Statis.notify({"status": "error", "label": node_label, "message": node_label + " " + e.message})
			// s.destroy()
		})
		s.end()
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
	},

	scan: function(nodes, daemon)
	{
		var callback = function(e) {
			Statis.notify({"status": "error", "message": e.message})
		}

		for (var i=0; i<nodes.length; i++) {
			if (daemon)
				Statis.scheduleScan(nodes[i], callback)
			else
				Statis.scanNode(nodes[i], callback)
		}
	},

	scanNode: function(node, callback)
	{
		try {
			if (node.http)
				Statis.doHttp(node)

			if (node.socket)
				Statis.doSocket(node)

			if (node.mysql)
				Statis.doMysql(node)
		} catch (ex) {
			callback(ex)
		}
	},

	scheduleScan: function(node, callback)
	{
		try {
			new CronJob({
				cronTime: node.cron,
				onTick: function() {
					Statis.scanNode(node)
				},
				start: true
			})
		} catch(ex) {
			callback(ex)
		}
	}
}

module.exports.scan = function(nodes, daemon) { Statis.scan(nodes, daemon) }
module.exports.http = function(node) { Statis.doHttp(node) }
module.exports.socket = function(node) { Statis.doSocket(node) }
module.exports.mysql = function(node) { Statis.doMysql(node) }
module.exports.on = function(event, listener) { eventEmitter.on(event, listener) }
module.exports.removeListener = function(event, listener) { eventEmitter.removeListener(event, listener) }
module.exports.registerNotificationListeners = function(config) { Statis.registerNotificationListeners(config) }

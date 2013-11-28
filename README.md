# Statis


A simple monitoring application for websites and MySQL

## Installation

Statis requires nodejs 0.10.x

To install from GitHub, clone the repository and install dependencies using npm:

```
git clone git://github.com/softius/Statis.git
cd Statis
npm install
node console.js
```

Help is available by executing `node console.js -h`.

## Configuration

Configuration goes in `config.json`. You can start by copying `config-sample.json` to `config.json`. Statis perceives all endpoints to be monitored as nodes and provides support for http, mysql and sockets in general. 

It is also possible to have multiple configuration files. Create a new file i.e. `config2.json` in any directory according to the structure defined in `config-sample.json`. The new configuration file can be passed during execution via `-c` option as follows:

```node console.js -c config2.json```

``` JAVASCRIPT
{
	"nodes": [
		{
			"label": "Google",
			"http": {
				"hostname": "google.com",
				"port": 80,
				"path": "/",
				"method": "GET"
			}
		}
	]
}
```

Here is an example for configuring http nodes
``` JAVASCRIPT
{
	"label": "Google",
	"http": {
		"hostname": "google.com",
		"port": 80,
		"path": "/",
		"method": "GET"
	}
}
```

Here is an example for configuring socket nodes
``` JAVASCRIPT
{
	"label": "Google",
	"socket": {
		"host": "google.com",
		"port": 80
	}
}
```

Here is an example for configuring mysql nodes
``` JAVASCRIPT
{
	"label": "Localhost MySQL",
	"mysql": {
		"host": "127.0.0.1",
		"user": "root",
		"password": "root"
	}
}
```

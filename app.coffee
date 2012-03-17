
# Module dependencies.

express = require 'express'
coffee = require 'coffee-script'
fs = require 'fs'
stylus = require 'stylus'
nib = require 'nib'
routes = require './routes'

port = process.env.PORT || 3000
app = module.exports = express.createServer()

# Configuration

app.configure () ->
	app.set 'views', __dirname + '/views'
	app.set 'view engine', 'jade'
	app.use express.bodyParser()
	app.use express.methodOverride()
	app.use express.cookieParser()
	app.use stylus.middleware {
		src: __dirname + '/stylus'
		dest: __dirname + '/public'
		compile: (str, path) ->
			return stylus(str)
				.set('filename', path)
				.set('compress', true)
				.use(nib())
				.import('nib')
	}
	app.use express.static __dirname + '/public'
	app.use app.router
	app.use (req, res, next) ->
		res.render '404', {
			layout: false
			status: 404
		}
	app.use (err, req, res, next) ->
		res.send '500', { status: err.status || 500, error: err }

app.configure 'development', () ->
	app.use express.errorHandler { dumpExceptions: true, showStack: true }

app.configure 'production', () ->
	app.use express.errorHandler()

app.error (err, req, res, next) ->
	console.log(err, req, res, next)

# Coffee to JS compilation
app.get '/js/:file.js', (req, res) ->
	try
		cs = fs.readFileSync(__dirname+'/coffee/'+req.params.file+'.coffee', 'ascii')
		js = coffee.compile cs
		res.header 'Content-Type', 'application/x-javascript'
		res.send js
	catch error
		res.render '404', {
			layout: false
			status: 404
		}

# Routes

app.get '/', routes.index

app.listen port
console.log "Express server listening on port %d in %s mode", app.address().port, app.settings.env
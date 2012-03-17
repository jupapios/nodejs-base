(function() {
  var app, coffee, express, fs, nib, port, routes, stylus;

  express = require('express');

  coffee = require('coffee-script');

  fs = require('fs');

  stylus = require('stylus');

  nib = require('nib');

  routes = require('./routes');

  port = process.env.PORT || 3000;

  app = module.exports = express.createServer();

  app.configure(function() {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.use(stylus.middleware({
      src: __dirname + '/stylus',
      dest: __dirname + '/public',
      compile: function(str, path) {
        return stylus(str).set('filename', path).set('compress', true).use(nib())["import"]('nib');
      }
    }));
    app.use(express.static(__dirname + '/public'));
    app.use(app.router);
    app.use(function(req, res, next) {
      return res.render('404', {
        layout: false,
        status: 404
      });
    });
    return app.use(function(err, req, res, next) {
      return res.send('500', {
        status: err.status || 500,
        error: err
      });
    });
  });

  app.configure('development', function() {
    return app.use(express.errorHandler({
      dumpExceptions: true,
      showStack: true
    }));
  });

  app.configure('production', function() {
    return app.use(express.errorHandler());
  });

  app.error(function(err, req, res, next) {
    return console.log(err, req, res, next);
  });

  app.get('/js/:file.js', function(req, res) {
    var cs, js;
    try {
      cs = fs.readFileSync(__dirname + '/coffee/' + req.params.file + '.coffee', 'ascii');
      js = coffee.compile(cs);
      res.header('Content-Type', 'application/x-javascript');
      return res.send(js);
    } catch (error) {
      return res.render('404', {
        layout: false,
        status: 404
      });
    }
  });

  app.get('/', routes.index);

  app.listen(port);

  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

}).call(this);

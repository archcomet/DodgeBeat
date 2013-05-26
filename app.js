//noinspection ThisExpressionReferencesGlobalObjectJS
(function () {
    'use strict';

    // Modules
    var express = require('express'),
        http = require('http'),
        url = require('url'),
        path = require('path'),
        config = require('./scripts/config.js'),
        Track = require('./scripts/track'),
        Converter = require('./scripts/converter.js'),

        // Application setup
        app = express(),
        port = process.env.PORT || config.port,
        directory = path.join(__dirname, '/public');

    app.configure(function () {
        app.use(express.methodOverride());
        app.use(express.bodyParser());
        app.use(express.static(directory));
        app.use(express.logger({
            'format': ':date :method :url :status - :response-time ms'
        }));
        app.use(app.router);
    });

    app.configure('development', function () {
        app.use(express.errorHandler({dumpExceptions: true, showStack: true }));
    });

    app.configure('production', function () {
        app.use(express.errorHandler());
    });

    (function() {

        /**
         * redirects request to base uri
         * @param req
         * @param res
         */

        function redirect(req, res) {
            res.redirect('/');
        }

        /**
         * gets stream from SoundCloud by id
         * @param req
         * @param res
         */

        function getStream(req, res) {
            var track = Track.create({id: req.params.id}),
                converter = Converter.create();

            res.contentType('application/ogg');

            track.stream(function (err, steam) {
                if (err) {
                    console.log(err);
                    res.send(503, err);
                    return;
                }
                steam.pipe(converter.process.stdin);
                converter.process.stdout.pipe(res);
            });

            res.header('Access-Control-Allow-Origin', '*');

            // may need long polling here ?
            // https://devcenter.heroku.com/articles/request-timeout
            // res.header('transports', ['xhr-polling']);

            req.on('close', function () {
                track.stopStream();
                converter.kill();
            });
        }

        /**
         * Routing
         */

        app.get('/tracks/:id', redirect);
        app.get('/stream/:id', getStream);

    }());

    // Start server
    http.createServer(app).listen(port);
    console.log('DodgeBeat server listening on port %d in %s mode', port, app.settings.env);

}());
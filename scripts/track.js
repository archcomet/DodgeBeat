(function () {
    'use strict';

    // Modules
    var http = require('http'),
        url = require('url'),
        fs = require('fs'),
        path = require('path'),
        config = require('./config.js');

    module.exports = (function (){

        /**
         * optionsForRequest (helper)
         */

        function optionsForRequest(trackId) {
            return {
                host: 'api.soundcloud.com',
                path: '/tracks/' + trackId + '/stream?client_id=' + config.soundCloud.clientId,
                headers: {
                    'User-Agent': 'node.js'
                }
            };
        }

        /**
         * optionsFromLocation (helper)
         */

        function optionsFromLocation(location) {
            return {
                host: location.host,
                path: location.pathname + location.search,
                headers: {
                    'User-Agent': 'node.js'
                }
            };
        }

        /**
         * Track
         * @param attributes
         * @param image
         * @constructor
         */

        function Track(attributes, image) {
            this.attributes = attributes;
            this.image = image;
        }

        /**
         * create (static)
         * Instantiates a new Track
         * @param attributes
         * @param files
         * @returns {Track}
         */

        Track.create = function (attributes, files) {
            return new Track(attributes, files && files.image);
        };

        Track.prototype.stream = function (fn) {
            var self = this;
            http.get(optionsForRequest(this.id()), function (res) {
                if (!res.headers.location) {
                    fn(['No stream url for track', self.id()].join(' '));
                    return;
                }

                var location = url.parse(res.headers.location);
                self.request = http.get(optionsFromLocation(location), function (res) {
                    fn(null, res);
                });
            });
        };

        Track.prototype.stopStream =  function () {
            if (this.request) {
                this.request.destroy();
            }
        };

        Track.prototype.id = function () {
            return this.attributes.id;
        };

        return Track;

    }());

}());